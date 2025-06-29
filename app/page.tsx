import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Shield, Server, Github } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="h-8 w-8" />
            <span className="font-bold text-2xl">CloudVault</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Secure & Private
          <span className="text-primary block">File Storage</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Store, manage, and access your files with enterprise-grade security. End-to-end encryption meets HDFS
          reliability.
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild>
            <Link href="/register">Start Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose CloudVault?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>End-to-End Encryption</CardTitle>
              <CardDescription>
                Your files are encrypted before they leave your device. Only you have the keys.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Server className="h-12 w-12 text-primary mb-4" />
              <CardTitle>HDFS Reliability</CardTitle>
              <CardDescription>
                Built on Hadoop Distributed File System for maximum uptime and data integrity.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Github className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Open Source</CardTitle>
              <CardDescription>Transparent, auditable code. Affordable pricing with no vendor lock-in.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Cloud className="h-6 w-6" />
              <span className="font-bold">CloudVault</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">
                About
              </Link>
              <Link href="#" className="hover:text-foreground">
                Contact
              </Link>
              <Link href="#" className="hover:text-foreground">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
