import UfwControlPanel from "@/components/UfwControlPanel";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <UfwControlPanel />
      </div>
      <Footer />
    </div>
  )
}
