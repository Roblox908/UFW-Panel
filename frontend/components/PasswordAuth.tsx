"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react'; 
import Image from 'next/image';


interface PasswordAuthProps {
  backendUrl: string; // Add backendUrl prop
  onSuccess: () => void;
  onError: (message: string) => void;
  clearError: () => void;
}

export default function PasswordAuth({ backendUrl, onSuccess, onError, clearError }: PasswordAuthProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null); 
    clearError();

    const apiUrl = new URL('/api/auth', window.location.origin);
    apiUrl.searchParams.append('backendUrl', backendUrl);

    try {
      const response = await fetch(apiUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        onSuccess(); 
      } else {
        const errorMessage = data.error || 'Authentication failed.';
        setLocalError(errorMessage); 
        onError(errorMessage); 
      }
    } catch (err) {
      console.error("API call failed:", err);
      const errorMessage = 'An error occurred during authentication.';
      setLocalError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh]">
      <Card className="w-full max-w-sm">
        <CardHeader className='flex flex-col justify-center mb-5 items-center'>
          <Image src="/favicon.png" alt="Logo" width={80} height={80}/>
          <CardTitle className='text-xl'>Authentication</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {localError && (
               <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Authentication Error</AlertTitle>
                 <AlertDescription>{localError}</AlertDescription>
               </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLocalError(null); clearError(); }} 
                required
                placeholder="Enter password"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className='flex justify-center'>
            <Button type="submit" className="w-50 mt-10" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
