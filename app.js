const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

/***
* Simular peticion async http 1.5 segundos
*/
const fakeHTTPMenu = async () => {
  console.log('⚡ Server request!')
  await delay(1500)
  console.log('⚡ Server return!')
  return Promise.resolve([{ body: 'Arepas' }, { body: 'Empanadas' }])
}

/***
* Simular peticion async http 0.5 segundos
*/
const fakeHTTPPayment = async () => {
  const link = `https://barbershopjp.wbooking.app/`
  console.log('⚡ Server request!')
  await delay(500)
  console.log('⚡ Server return!')
  return Promise.resolve([
      { body: `Puedes reservar tu cita en el siguiente link: ${link}` },
  ])
}

const flujoFotos = addKeyword('fotos','imagenes').addAnswer(
  ['Aca te muestro algunos de nuestros cortes']
)
const flujoUbicacion = addKeyword('ubicacion','ubicación','Ubicación','ubicados','lugar','donde queda').addAnswer(
  ['📍 Limón, Siquirres, a un costado del Gollo plaza S&M Local #3','Link ubicación: https://goo.gl/maps/g3dWZkqCUkMoTWDX7']
)
const flujoPrecio = addKeyword('precio').addAnswer(['💈Estos son los precios de nuestros servicios💈 ','Corte General: *4000*💵 ',
'Corte y barba: *5000*💵 ','Cejas: *1000*💵 ','Marcado: *2000*💵 ','Corte Niño: *3500*💵 ','Barba: *2000*💵 '])

const flujoHorario = addKeyword('horario','Horario').addAnswer(['💈Estos son los horarios💈 ','Lunes a sabado: *9:00AM a 7:00PM*🕐✂️ ','Domingo: *CERRADO*🕐✂️ '],null)
const flujosCita = addKeyword('cita').addAnswer(
  ['Accediendo a este link podras agendar tu cita☎️📆'],
  null,
  async (_, { flowDynamic }) => {
      const link = await fakeHTTPPayment()
      return flowDynamic(link)
  }
)
.addAnswer('Te esperamos!🪒💈👋')

const flujoPedido = addKeyword(['cita', 'pedir']).addAnswer(
  '¿Como quieres pagar en *efectivo* o *online*?',
  null,
  null,
  [flujoPrecio, flujosCita]
)

const conversacionPrincipal = addKeyword(['hola', 'ole', 'buenas', 'inicio','buenos','dias','saludos','hello','hi','Como estas?','pura vida','todo bien'])
  .addAnswer('*¡Bienvenido a Barber Shop JP!* 🪒💈👋',{media: 'https://i.postimg.cc/ZnSS4h9m/barbershopjp.jpg'})
  .addAnswer(
      [`Estas son las opciones:`,'👉Selecciona *Cita* para obtener el link','👉 Selecciona *Precio* para obtener los precios','👉 Selecciona *Horario* para obtener los horarios','👉 Selecciona *Ubicacion* para obtener la ubicacion,','👉 Selecciona *Fotos* para obtener fots de algunos cortes.'],{
        buttons:[
          {
            body: 'Cita'
          },
          {
            body: 'Precio'
          },
          {
            body: 'Horario'
          },
          {
            body: 'Ubicacion'
          },
          {
            body: 'Fotos'
          }
        ]
      },
      [
        flujosCita,flujoPrecio,flujoHorario,flujoUbicacion,flujoFotos
    ]
      
  )


const main = async () => {
  const adapterDB = new MockAdapter()
  const adapterFlow = createFlow([conversacionPrincipal,flujosCita, flujoUbicacion, flujoPrecio, flujoHorario, flujoFotos])
  const adapterProvider = createProvider(BaileysProvider)

  createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
  })

  
}
QRPortalWeb()
main()
