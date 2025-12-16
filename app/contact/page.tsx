"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormProgress } from "@/components/form-progress"
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"

export default function ContactPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular envío del formulario
    setTimeout(() => {
      console.log("Formulario enviado:", formData)
      setIsSubmitted(true)
      setLoading(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "",
        message: "",
      })
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button asChild variant="ghost" size="sm" className="mb-8">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.backToHome")}
              </Link>
            </Button>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">{t("contact.sent")}</CardTitle>
                <CardDescription>{t("contact.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    {t("contact.sentDesc")}
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button asChild className="w-full">
                    <Link href="/">{t("common.backToHome")}</Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                    {t("contact.send")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Encabezado */}
          <div className="space-y-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("common.backToHome")}
              </Link>
            </Button>

            <div>
              <h1 className="text-4xl font-bold mb-2">{t("contact.title")}</h1>
              <p className="text-muted-foreground text-lg">
                {t("contact.subtitle")}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("contact.sendMessage")}</CardTitle>
                  <CardDescription>
                    {t("contact.sendMessageDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <FormProgress
                      fields={[
                        { name: 'name', value: formData.name, required: true, label: 'Nombre' },
                        { name: 'email', value: formData.email, required: true, label: 'Email' },
                        { name: 'phone', value: formData.phone, required: false, label: 'Teléfono' },
                        { name: 'category', value: formData.category, required: true, label: 'Categoría' },
                        { name: 'subject', value: formData.subject, required: true, label: 'Asunto' },
                        { name: 'message', value: formData.message, required: true, label: 'Mensaje' },
                      ]}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          {t("contact.name")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t("contact.name")}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          {t("contact.email")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("contact.phone")} ({t("common.optional")})</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+51 999 999 999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        {t("contact.category")} <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                        <SelectTrigger id="category">
                          <SelectValue placeholder={t("contact.category")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Consulta General</SelectItem>
                          <SelectItem value="technical">Soporte Técnico</SelectItem>
                          <SelectItem value="events">Eventos</SelectItem>
                          <SelectItem value="vendors">Vendedores</SelectItem>
                          <SelectItem value="billing">Facturación</SelectItem>
                          <SelectItem value="feedback">Comentarios y Sugerencias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        {t("contact.subject")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder={t("contact.subject")}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {t("contact.message")} <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t("contact.message")}
                        rows={6}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Mínimo 20 caracteres, máximo 1000 caracteres
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {t("contact.sending")}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {t("contact.send")}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Información de contacto */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("contact.info")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">support@eventosagro.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">+51 999 999 999</p>
                      <p className="text-xs text-muted-foreground">Lun - Vie: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Oficina</p>
                      <p className="text-sm text-muted-foreground">
                        Av. Universitaria 1801
                        <br />
                        San Miguel, Lima - Perú
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preguntas Frecuentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Antes de contactarnos, revisa nuestra sección de preguntas frecuentes, donde podrás encontrar
                    respuestas rápidas a las consultas más comunes.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/faq">Ver FAQ</Link>
                  </Button>
                </CardContent>
              </Card>

              <Alert>
                <AlertDescription className="text-xs">
                  💡 <strong>Tiempo de respuesta:</strong> Generalmente respondemos en menos de 24 horas en días
                  laborables.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
