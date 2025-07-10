export default function AboutFAQ() {
    const faqs = [
        {
            question: "¿Hacen ventas por mayor de artículos deportivos?",
            answer:
              "Lamentablemente no trabajamos con modalidad de venta por mayor en este momento. Todas las ventas son precio detalle.",
        },
        {
            question: "¿Tienen Factura o Boleta?",
            answer:
              "Zona Deportiva vende todos sus productos con boleta o factura electrónica. Usted debe informar qué opción desea y agregar los datos correspondientes en el caso de las factura.",
        },
        {
            question: "¿Cuál es medio de pago?",
            answer:
              'Puedes cancelar tus pedidos con Redcompra o tarjetas bancarias vía WEBPAY, lo que garantiza la seguridad de su transacción. Para compras de gran volumen debes contactarte vía correo: contacto@zonadeportiva.cl. En nuestra oficina también contamos con POS de Transbank. No recibimos pagos en efectivo.',
        },
        {
            question: "¿Cuál es el horario de atención?",
            answer:
              "Zona Deportiva atiende telefónicamente de Lunes a Viernes de 10:00 a 18:30. También por correo y WhatsApp (+56 9 3936 9828). La sucursal en Gral. Ordóñez 155 Oficina 1002 atiende en el mismo horario, previa coordinación.",
        },
        {
            question: "¿Cuánto demora en llegar una compra?",
            answer:
                "Las compras pagadas por WEBPAY demoran entre 2 y 7 días hábiles para Santiago; lo mismo aplica para pagos por transferencia tras validación bancaria. Para regiones, depende de la empresa de envíos y la localidad.",
        },
        {
            question: "¿Los productos tienen garantía?",
            answer:
                "Todos los artículos deportivos poseen garantía de 3 meses por fallas de material o fabricación. Debes presentar boleta o factura. La garantía no cubre el despacho y no considera devolución del dinero. El cambio dependerá de stock y marcas.",
        },
        {
            question: "¿Puedo obtener descuento?",
            answer:
                "Si necesitas una gran cantidad de artículos o eres una institución, empresa o colegio, comunícate con nosotros y evaluaremos descuentos y alternativas de despacho.",
        },
        {
            question: "¿Puedo cotizar varios artículos para un colegio, empresa o institución?",
            answer:
                "Sí. Envíanos correo a contacto@zonadeportiva.cl o WhatsApp +56 9 3936 9828 para cotización formal. Solicitarás datos como razón social, R.U.T., dirección, nombre de encargado y teléfono.",
        },
        {
            question: "¿Hacen reembolsos o devolución de dinero?",
            answer:
                "Tienes 10 días desde la recepción del producto. Para solicitarlo, envía correo con número de boleta o factura, nombre y teléfono. El reembolso será por transferencia electrónica. El despacho no es reembolsable y el artículo debe estar sin uso, en su envase original y condiciones excelentes. La devolución se realiza en Gral. Ordóñez 155 Of. 1002, Maipú.",
        },
        {
            question: "¿Pueden vender en Mercado Público?",
            answer:
                "Zona Deportiva participa activamente en licitaciones de Mercado Público y está inscrita en el registro oficial de proveedores del Estado, Chileproveedores.",
        },
        {
            question: "¿Puedo pagar en efectivo cuando llegue el producto?",
            answer:
                "No. Solo se pueden hacer pagos vía Webpay Plus (tarjetas o transferencia). Los despachos en Santiago y regiones se cobran al momento de compra o al recibir, pero no se acepta efectivo en la oficina.",
        },
        {
            question: "¿Hacen despachos a regiones?",
            answer:
                "Sí. Al comprar informas si eres de Santiago o región. En Santiago enviamos por empresas externas o área propia. En regiones coordinamos envíos por pagar a oficinas o domicilio, recomendando la empresa de transporte. Para detalles, comunícate al correo o WhatsApp +56 9 3936 9828.",
        },
    ]

    return (
        <section id="faq">
            <div className="flex flex-col gap-2 mb-8">
                <h2 className="text-xl md:text-2xl font-medium">Preguntas Frecuentes</h2>
                <p>Explora los temas de ayuda más consultados por nuestros clientes.</p>
            </div>
            <div className="flex flex-col">
                {faqs.map((faq, i) => (
                    <div key={i} tabIndex={0} className="collapse collapse-plus bg-base-100 border border-base-300 rounded-none">
                        <input type="checkbox" className="peer" />
                        <div className="collapse-title font-semibold">{faq.question}</div>
                        <div className="collapse-content text-sm">
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
