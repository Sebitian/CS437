
import Image from "next/image";
import Dashboard from "@/components/Dashboard/Dashboard";
import DefaultLayout from "@/components/Layouts/DefaultLayout";


export default async function Home() {
 
  return (
    <DefaultLayout>
      <Dashboard />
    </DefaultLayout>
    
    
  );
}