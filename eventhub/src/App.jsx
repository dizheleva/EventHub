import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/HomePage"
import { Features } from "@/components/home/Features"

export default function App() {
  return (
    <Layout>
      <HomePage />
      <Features />
    </Layout>
  )
}