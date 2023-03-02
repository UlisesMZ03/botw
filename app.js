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

const flujoUbicacion = addKeyword('ubicacion','ubicación','Ubicación','ubicados','lugar','donde queda').addAnswer(
  ['📍 Limón, Siquirres, a un costado del Gollo plaza S&M Local #3','Link ubicación: https://goo.gl/maps/g3dWZkqCUkMoTWDX7']
)
const flujoPrecio = addKeyword('precio').addAnswer(['💈Estos son los precios de nuestros servicios💈 ','Corte basico: *4000*💵 ',
'Corte con barba: *5000*💵 '])

const flujoHorario = addKeyword('horario','Horario').addAnswer(['💈Estos son los horarios💈 ','Lunes a sabado: *9:00AM a 6:00PM*🕐✂️ ','Domingo: *CERRADO*🕐✂️ '],null)
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
  .addAnswer('*¡Bienvenido a Barber Shop JP!* 🪒💈👋',{media: 'https://scontent.fsyq4-2.fna.fbcdn.net/v/t39.30808-6/333216403_528395052771234_1466611020822997947_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=8bfeb9&_nc_ohc=S05d7YLrxD8AX-n40yA&_nc_ht=scontent.fsyq4-2.fna&oh=00_AfB09p74HBxiqFO1fdIeW2UOEdTJShcGtZ3OEeTUIq1PAg&oe=640569EB'})
  .addAnswer(
      [`Estas son las opciones:`,'👉Selecciona *Cita* para obtener el link','👉 Selecciona *Precio* para obtener los precios','👉 Selecciona *Ubicacion* para obtener la ubicacion'],{
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
          }
        ]
      },
      [
        flujosCita,flujoPrecio,flujoHorario,flujoUbicacion
    ]
      
  )


const main = async () => {
  const adapterDB = new MockAdapter()
  const adapterFlow = createFlow([conversacionPrincipal,flujosCita, flujoUbicacion, flujoPrecio, flujoHorario])
  const adapterProvider = createProvider(BaileysProvider)

  createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
  })

  QRPortalWeb()
}

main()
