
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

export default function LegalPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Términos Legales y Política de Privacidad</CardTitle>
          <CardDescription>
            Información importante sobre el uso de FeedBacks y la protección de tus datos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6 text-sm text-foreground">
              <section>
                <h2 className="text-xl font-semibold mb-2">1. Introducción</h2>
                <p>
                  Bienvenido/a a FeedBacks. Estos términos y condiciones describen las reglas y regulaciones para el uso del sitio web de FeedBacks, ubicado en https://feedbacks.freympc.com, y operando en Madrid.
                  Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones. No continúes usando FeedBacks si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">2. Licencia</h2>
                <p>
                  A menos que se indique lo contrario, FeedBacks y/o sus licenciantes poseen los derechos de propiedad intelectual de todo el material en FeedBacks. Todos los derechos de propiedad intelectual son reservados. Puedes acceder a esto desde FeedBacks para tu propio uso personal sujeto a las restricciones establecidas en estos términos y condiciones.
                </p>
                <p className="mt-2">No debes:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
                  <li>Republicar material de FeedBacks</li>
                  <li>Vender, alquilar o sublicenciar material de FeedBacks</li>
                  <li>Reproducir, duplicar o copiar material de FeedBacks</li>
                  <li>Redistribuir contenido de FeedBacks</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">3. Recomendaciones y Contenido del Usuario</h2>
                <p>
                  Eres responsable de la información y el contenido que publicas en FeedBacks ("Contenido del Usuario"), incluyendo recomendaciones, comentarios y datos de perfil. Al enviar Contenido del Usuario, otorgas a FeedBacks una licencia mundial, no exclusiva, libre de regalías, sublicenciable y transferible para usar, reproducir, distribuir, preparar trabajos derivados, mostrar y ejecutar el Contenido del Usuario en conexión con el servicio y el negocio de FeedBacks.
                </p>
                <p className="mt-2">
                  Asegúrate de que cualquier información personal compartida dentro de una recomendación, ya sea tuya o de terceros, se comparte con el consentimiento apropiado y de acuerdo con las leyes de protección de datos aplicables, incluyendo GDPR.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">4. Cumplimiento de GDPR</h2>
                <p>
                  FeedBacks se compromete a proteger tu privacidad y cumplir con el Reglamento General de Protección de Datos (GDPR).
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-1">
                  <li>
                    <strong>Recopilación de Datos:</strong> Recopilamos información que proporcionas directamente, como tu nombre, correo electrónico, sector profesional y el contenido de tus recomendaciones. Esta información se utiliza para operar y mejorar el servicio.
                  </li>
                  <li>
                    <strong>Uso de Datos:</strong> Tus datos se utilizan para mostrar recomendaciones, personalizar tu experiencia y comunicarnos contigo. No compartiremos tu información personal con terceros para fines de marketing sin tu consentimiento explícito.
                  </li>
                  <li>
                    <strong>Tus Derechos:</strong> Bajo GDPR, tienes derecho a acceder, rectificar, borrar, restringir el procesamiento y portar tus datos personales. También puedes oponerte al procesamiento de tus datos. Para ejercer estos derechos, escríbenos mediante el formulario de contacto indicando la referencia #FeedBacks.
                  </li>
                  <li>
                    <strong>Base Legal para el Procesamiento:</strong> Procesamos tus datos basándonos en tu consentimiento al registrarte y compartir recomendaciones, y para la ejecución de los servicios que te proporcionamos.
                  </li>
                  <li>
                    <strong>Seguridad de los Datos:</strong> Implementamos medidas técnicas y organizativas para proteger tus datos personales. Sin embargo, ninguna transmisión por Internet es completamente segura.
                  </li>
                  <li>
                    <strong>Retención de Datos:</strong> Retendremos tus datos personales mientras tengas una cuenta activa o según sea necesario para proporcionarte los servicios. También podemos retener y usar tu información según sea necesario para cumplir con nuestras obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-2">5. Cookies</h2>
                <p>
                  El sitio web utiliza cookies para ayudar a personalizar tu experiencia en línea. Al acceder a FeedBacks, aceptaste utilizar las cookies requeridas.
                  Una cookie es un archivo de texto que un servidor de páginas web coloca en tu disco duro. Las cookies no se pueden utilizar para ejecutar programas o enviar virus a tu computadora. Las cookies se te asignan de forma exclusiva y solo pueden ser leídas por un servidor web en el dominio que emitió la cookie.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">6. Modificaciones de los Términos</h2>
                <p>
                  FeedBacks se reserva el derecho de revisar estos términos y condiciones en cualquier momento según lo considere oportuno, y al usar este sitio web se espera que revises estos términos de forma regular.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-2">7. Contacto</h2>
                <p>
                  Si tienes alguna pregunta sobre alguno de nuestros términos, por favor contáctanos en el formulario con la referencia #FeedBacks.
                </p>
              </section>

              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-8">
                  Última actualización: {lastUpdated}
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
