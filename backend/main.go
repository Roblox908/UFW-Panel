package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var expectedAPIKey string

func AuthMiddleware() gin.HandlerFunc {
	expectedAPIKey = os.Getenv("UFW_API_KEY")
	if expectedAPIKey == "" {
		log.Fatal("FATAL: UFW_API_KEY environment variable not set.")
	}

	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-KEY")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "API key required"})
			c.Abort()
			return
		}

		if apiKey != expectedAPIKey {
			c.JSON(http.StatusForbidden, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Could not load .env file:", err)
	}

	router := gin.Default()

	allowedOriginsEnv := os.Getenv("CORS_ALLOWED_ORIGINS")
	var allowedOrigins []string
	if allowedOriginsEnv != "" {
		allowedOrigins = strings.Split(allowedOriginsEnv, ",")
		for i := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(allowedOrigins[i])
		}
	} else {
		allowedOrigins = []string{"http://localhost:3000"}
		log.Println("Warning: CORS_ALLOWED_ORIGINS environment variable not set. Defaulting to 'http://localhost:3000'")
	}

	log.Printf("Configuring CORS with allowed origins: %v", allowedOrigins)

	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "X-API-KEY"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	authorized := router.Group("/")
	authorized.Use(AuthMiddleware())
	{
		authorized.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "pong"})
		})

		authorized.GET("/status", func(c *gin.Context) {
			status, err := GetUFWStatus()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get UFW status", "details": err.Error()})
				return
			}
			c.JSON(http.StatusOK, status)
		})

		type AllowRuleRequest struct {
			Rule    string `json:"rule" binding:"required"`
			Comment string `json:"comment"`
		}

		authorized.POST("/rules/allow", func(c *gin.Context) {
			var req AllowRuleRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
				return
			}

			err := AllowUFWPort(req.Rule, req.Comment)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add allow rule", "details": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Rule added successfully", "rule": req.Rule, "comment": req.Comment})
		})

		type DenyRuleRequest struct {
			Rule    string `json:"rule" binding:"required"`
			Comment string `json:"comment"`
		}

		authorized.POST("/rules/deny", func(c *gin.Context) {
			var req DenyRuleRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
				return
			}

			err := DenyUFWPort(req.Rule, req.Comment)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add deny rule", "details": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Deny rule added successfully", "rule": req.Rule, "comment": req.Comment})
		})

		authorized.DELETE("/rules/delete/:number", func(c *gin.Context) {
			ruleNumber := c.Param("number")
			if ruleNumber == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Rule number parameter is required"})
				return
			}

			err := DeleteUFWByNumber(ruleNumber)
			if err != nil {
				if strings.Contains(err.Error(), "not found") {
					c.JSON(http.StatusNotFound, gin.H{"error": "Rule not found", "details": err.Error()})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete rule", "details": err.Error()})
				}
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Rule deleted successfully", "rule_number": ruleNumber})
		})

		authorized.POST("/enable", func(c *gin.Context) {
			log.Println("Attempting to enable UFW via API endpoint...")
			err := EnableUFW()
			if err != nil {
				log.Printf("Error enabling UFW via API: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enable UFW", "details": err.Error()})
				return
			}
			log.Println("UFW enabled successfully via API.")
			c.JSON(http.StatusOK, gin.H{"message": "UFW enabled successfully"})
		})

		authorized.POST("/disable", func(c *gin.Context) {
			err := DisableUFW()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to disable UFW", "details": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "UFW disabled successfully (or was already inactive)"})
		})

		type IPRuleRequest struct {
			IPAddress    string `json:"ip_address" binding:"required"`
			PortProtocol string `json:"port_protocol"`
			Comment      string `json:"comment"`
		}

		authorized.POST("/rules/allow/ip", func(c *gin.Context) {
			var req IPRuleRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
				return
			}

			err := AllowUFWFromIP(req.IPAddress, req.PortProtocol, req.Comment)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add allow rule from IP", "details": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Allow rule from IP added successfully", "ip_address": req.IPAddress, "port_protocol": req.PortProtocol, "comment": req.Comment})
		})

		authorized.POST("/rules/deny/ip", func(c *gin.Context) {
			var req IPRuleRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
				return
			}

			err := DenyUFWFromIP(req.IPAddress, req.PortProtocol, req.Comment)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add deny rule from IP", "details": err.Error()})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Deny rule from IP added successfully", "ip_address": req.IPAddress, "port_protocol": req.PortProtocol, "comment": req.Comment})
		})

	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "30737"
	}

	apiPort := os.Getenv("PORT")
	if apiPort == "" {
		apiPort = "30737"
	}
	apiRule := apiPort + "/tcp"

	log.Printf("Attempting to add allow rule for API port %s during startup...", apiRule)
	startupErr := AllowUFWPort(apiRule, "")
	if startupErr != nil {
		if strings.Contains(startupErr.Error(), "Skipping adding existing rule") {
			log.Printf("Rule for API port '%s' already exists or skipping message detected.", apiRule)
		} else {
			log.Printf("WARNING: Error adding allow rule for API port '%s' during startup: %v. Ensure the server is run with sudo if needed.", apiRule, startupErr)
		}
	} else {
		log.Printf("Successfully added or ensured allow rule for API port: %s", apiRule)
	}

	log.Printf("Starting server on port %s", port)
	router.Run(":" + port)
}
