"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FrontPageTabProps {
  currentEmployeeId: string
  onSubmitForApproval: (data: any) => void
}

export function FrontPageTab({ currentEmployeeId, onSubmitForApproval }: FrontPageTabProps) {
  // Hero Section State
  const [heroTitle, setHeroTitle] = useState("Surigao Memorial Park")
  const [heroSubtitle, setHeroSubtitle] = useState("A Peaceful Final Resting Place")
  const [heroDescription, setHeroDescription] = useState(
    "Providing dignified memorial services and peaceful grounds for your loved ones"
  )

  // About Section State
  const [aboutTitle, setAboutTitle] = useState("About Us")
  const [aboutContent, setAboutContent] = useState(
    "Surigao Memorial Park has been serving families with compassion and dignity for over 20 years. We offer beautiful memorial grounds, professional services, and caring support during difficult times."
  )

  // Pricing State
  const [standardLotPrice, setStandardLotPrice] = useState("75,000")
  const [premiumLotPrice, setPremiumLotPrice] = useState("150,000")
  const [standardLotLabel, setStandardLotLabel] = useState("Standard Lot")
  const [premiumLotLabel, setPremiumLotLabel] = useState("Premium Lot")
  const [standardLotDescription, setStandardLotDescription] = useState(
    "2m x 1m burial lot with concrete headstone and garden border"
  )
  const [premiumLotDescription, setPremiumLotDescription] = useState(
    "3m x 2m burial lot with marble headstone, landscaping, and premium features"
  )

  // Contact Information State
  const [contactEmail, setContactEmail] = useState("info@surigaomemorialpark.com")
  const [contactPhone, setContactPhone] = useState("(123) 456-7890")
  const [contactAddress, setContactAddress] = useState("123 Memorial Drive, Surigao City")
  const [visitingHours, setVisitingHours] = useState("6:00 AM - 6:00 PM Daily")

  // Services State
  const [services, setServices] = useState([
    { id: 1, title: "Burial Services", description: "Professional burial arrangements and coordination" },
    { id: 2, title: "Memorial Services", description: "Customized memorial and celebration of life services" },
    { id: 3, title: "Lot Maintenance", description: "Regular grounds keeping and monument care" },
  ])

  const handleSubmitHeroSection = () => {
    const changeData = {
      section: "hero",
      changes: {
        title: heroTitle,
        subtitle: heroSubtitle,
        description: heroDescription,
      },
    }

    onSubmitForApproval({
      action_type: "content_update",
      target_entity: "website",
      change_data: changeData,
      notes: "Update hero section content",
      priority: "normal",
    })

    toast({
      title: "Submitted for Approval ⏳",
      description: "Hero section changes have been submitted for admin review.",
    })
  }

  const handleSubmitPricing = () => {
    const changeData = {
      section: "pricing",
      changes: {
        standard: {
          label: standardLotLabel,
          price: standardLotPrice,
          description: standardLotDescription,
        },
        premium: {
          label: premiumLotLabel,
          price: premiumLotPrice,
          description: premiumLotDescription,
        },
      },
    }

    onSubmitForApproval({
      action_type: "content_update",
      target_entity: "website",
      change_data: changeData,
      notes: "Update pricing information",
      priority: "high",
    })

    toast({
      title: "Submitted for Approval ⏳",
      description: "Pricing changes have been submitted for admin review.",
    })
  }

  const handleSubmitAboutSection = () => {
    const changeData = {
      section: "about",
      changes: {
        title: aboutTitle,
        content: aboutContent,
      },
    }

    onSubmitForApproval({
      action_type: "content_update",
      target_entity: "website",
      change_data: changeData,
      notes: "Update about section content",
      priority: "normal",
    })

    toast({
      title: "Submitted for Approval ⏳",
      description: "About section changes have been submitted for admin review.",
    })
  }

  const handleSubmitContactInfo = () => {
    const changeData = {
      section: "contact",
      changes: {
        email: contactEmail,
        phone: contactPhone,
        address: contactAddress,
        visiting_hours: visitingHours,
      },
    }

    onSubmitForApproval({
      action_type: "content_update",
      target_entity: "website",
      change_data: changeData,
      notes: "Update contact information",
      priority: "high",
    })

    toast({
      title: "Submitted for Approval ⏳",
      description: "Contact information changes have been submitted for admin review.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Front Page Management</h2>
          <p className="text-sm text-gray-600">Update website content and pricing displayed to the public</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Changes Require Admin Approval
        </Badge>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="about">About Us</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Main banner content displayed on the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Main headline"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Secondary headline"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="heroDescription">Hero Description</Label>
                <Textarea
                  id="heroDescription"
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  placeholder="Brief description"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSubmitHeroSection}>
                  Submit Changes for Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Section */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Us Section</CardTitle>
              <CardDescription>Information about the memorial park</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="aboutTitle">Section Title</Label>
                <Input
                  id="aboutTitle"
                  value={aboutTitle}
                  onChange={(e) => setAboutTitle(e.target.value)}
                  placeholder="About Us"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="aboutContent">About Content</Label>
                <Textarea
                  id="aboutContent"
                  value={aboutContent}
                  onChange={(e) => setAboutContent(e.target.value)}
                  placeholder="Write about the memorial park..."
                  rows={6}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSubmitAboutSection}>
                  Submit Changes for Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Section */}
        <TabsContent value="pricing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Lot Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Standard Lot</CardTitle>
                <CardDescription>Basic memorial lot pricing and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="standardLabel">Lot Label</Label>
                  <Input
                    id="standardLabel"
                    value={standardLotLabel}
                    onChange={(e) => setStandardLotLabel(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="standardPrice">Price (₱)</Label>
                  <Input
                    id="standardPrice"
                    value={standardLotPrice}
                    onChange={(e) => setStandardLotPrice(e.target.value)}
                    placeholder="75,000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="standardDescription">Description</Label>
                  <Textarea
                    id="standardDescription"
                    value={standardLotDescription}
                    onChange={(e) => setStandardLotDescription(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Premium Lot Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Premium Lot</CardTitle>
                <CardDescription>Premium memorial lot pricing and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="premiumLabel">Lot Label</Label>
                  <Input
                    id="premiumLabel"
                    value={premiumLotLabel}
                    onChange={(e) => setPremiumLotLabel(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="premiumPrice">Price (₱)</Label>
                  <Input
                    id="premiumPrice"
                    value={premiumLotPrice}
                    onChange={(e) => setPremiumLotPrice(e.target.value)}
                    placeholder="150,000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="premiumDescription">Description</Label>
                  <Textarea
                    id="premiumDescription"
                    value={premiumLotDescription}
                    onChange={(e) => setPremiumLotDescription(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmitPricing} size="lg">
              Submit Pricing Changes for Approval
            </Button>
          </div>
        </TabsContent>

        {/* Contact Info */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Public contact details and visiting hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email Address</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactAddress">Address</Label>
                <Input
                  id="contactAddress"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="visitingHours">Visiting Hours</Label>
                <Input
                  id="visitingHours"
                  value={visitingHours}
                  onChange={(e) => setVisitingHours(e.target.value)}
                  placeholder="6:00 AM - 6:00 PM Daily"
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSubmitContactInfo}>
                  Submit Changes for Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
              <CardDescription>Services displayed on the website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.map((service, index) => (
                <div key={service.id} className="p-4 border rounded-lg space-y-2">
                  <div>
                    <Label>Service {index + 1} Title</Label>
                    <Input
                      value={service.title}
                      onChange={(e) => {
                        const updated = [...services]
                        updated[index].title = e.target.value
                        setServices(updated)
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={service.description}
                      onChange={(e) => {
                        const updated = [...services]
                        updated[index].description = e.target.value
                        setServices(updated)
                      }}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    onSubmitForApproval({
                      action_type: "content_update",
                      target_entity: "website",
                      change_data: { section: "services", changes: services },
                      notes: "Update services section",
                      priority: "normal",
                    })
                    toast({
                      title: "Submitted for Approval ⏳",
                      description: "Services changes have been submitted for admin review.",
                    })
                  }}
                >
                  Submit Changes for Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Important Note</h4>
              <p className="text-sm text-blue-800">
                All changes to public-facing content require admin approval before going live. 
                Changes will be reviewed and approved/rejected in the admin dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
