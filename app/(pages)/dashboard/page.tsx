"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Code, FileIcon } from "lucide-react"

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("subscriptions")

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8">User Dashboard</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
                    <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    <TabsTrigger value="purchases">Purchases</TabsTrigger>
                    <TabsTrigger value="downloads">Downloads</TabsTrigger>
                    <TabsTrigger value="codeblocks">Code Blocks</TabsTrigger>
                    <TabsTrigger value="fileaccess">File Access</TabsTrigger>
                    <TabsTrigger value="emailupdates">Email Updates</TabsTrigger>
                </TabsList>
                <TabsContent value="subscriptions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Subscriptions</CardTitle>
                            <CardDescription>View and manage your current subscriptions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Your current plan: Pro</p>
                        </CardContent>
                        <CardFooter>
                            <Button>Upgrade Plan</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="purchases">
                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase History</CardTitle>
                            <CardDescription>View your past purchases and invoices.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul>
                                <li>Advanced Trading Course - $99.99</li>
                                <li>Custom Indicator Pack - $49.99</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="downloads">
                    <Card>
                        <CardHeader>
                            <CardTitle>Downloads</CardTitle>
                            <CardDescription>Access your downloaded resources.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full justify-start mb-2">
                                <Download className="mr-2 h-4 w-4" /> Trading Cheat Sheet.pdf
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="mr-2 h-4 w-4" /> Backtesting Template.xlsx
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="codeblocks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Code Blocks</CardTitle>
                            <CardDescription>View and manage your saved code blocks.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full justify-start mb-2">
                                <Code className="mr-2 h-4 w-4" /> RSI Strategy
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Code className="mr-2 h-4 w-4" /> Moving Average Crossover
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="fileaccess">
                    <Card>
                        <CardHeader>
                            <CardTitle>File Access</CardTitle>
                            <CardDescription>Manage access to your files.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full justify-start mb-2">
                                <FileIcon className="mr-2 h-4 w-4" /> Request File Access
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="emailupdates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Updates</CardTitle>
                            <CardDescription>Manage your email preferences.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2 mb-2">
                                <input type="checkbox" id="newsletter" className="form-checkbox" />
                                <label htmlFor="newsletter">Receive newsletter</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="marketAlerts" className="form-checkbox" />
                                <label htmlFor="marketAlerts">Receive market alerts</label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Preferences</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

