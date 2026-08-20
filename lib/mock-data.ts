import { WooCommerceOrder } from "@/types/woocommerce"

export const MOCK_ORDERS: WooCommerceOrder[] = [
  {
    id: 43734,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-28T09:14:00",
    total: "60.43",
    total_tax: "10.07",
    payment_method: "cod",
    payment_method_title: "Наложен платеж",
    tracking_type: "Speedy go адрес",
    source: "Директна",
    points: 60,
    documents: "Поръчка #0000001191",
    waybill: "Speedy #1013598435",
    export_status: "Tag or API",
    device_type: "Настолен компютър",
    specialist_id: "203680781",
    billing: {
      first_name: "Ивелин",
      last_name: "Атанасов",
      email: "ivelin_atanasov@abv.bg",
      phone: "+359898321565",
      address_1: "ул. СВ. ИРИНА, №11, вх.8, ет.1",
      city: "ВАРНА",
      postcode: "9000",
      country: "BG"
    },
    shipping: {
      first_name: "Ивелин",
      last_name: "Атанасов",
      address_1: "ул. СВ. ИРИНА, №11, вх.8, ет.1",
      city: "ВАРНА",
      postcode: "9000",
      country: "BG"
    },
    line_items: [
      {
        id: 201,
        name: "Zhermack алгинат Tropicalgin 453g",
        product_id: 6654,
        quantity: 1,
        price: 8.39,
        subtotal: "8.39",
        total: "8.39",
        total_tax: "1.68",
        sku: "06654"
      },
      {
        id: 202,
        name: "Solventum А-силикони Express STD Light Body/Regular Set зелена коректура 2 x 50 ml",
        product_id: 16820,
        quantity: 1,
        price: 41.97,
        subtotal: "41.97",
        total: "41.97",
        total_tax: "8.39",
        sku: "16820-GRN"
      }
    ]
  },
  {
    id: 43729,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-28T08:30:00",
    total: "26.50",
    total_tax: "4.42",
    payment_method: "stripe",
    payment_method_title: "Карта (Stripe)",
    tracking_type: "Econt Express",
    source: "Препоръка: Mail.bg",
    points: 27,
    documents: "Поръчка #0000001190",
    waybill: "Econt #530019284",
    export_status: "Tag or API",
    billing: {
      first_name: "Кирил",
      last_name: "Иванов",
      email: "kiril.ivanov@mail.bg",
      phone: "+359888123456",
      city: "София",
      country: "BG"
    },
    shipping: {
      first_name: "Кирил",
      last_name: "Иванов",
      city: "София",
      country: "BG"
    },
    line_items: [
      {
        id: 203,
        name: "Стоматологични полирни гуми паста 50ml",
        product_id: 7102,
        quantity: 1,
        price: 26.50,
        subtotal: "26.50",
        total: "26.50",
        sku: "POL-GUM-50"
      }
    ]
  },
  {
    id: 43726,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-28T07:45:00",
    total: "155.98",
    total_tax: "25.99",
    payment_method: "cod",
    payment_method_title: "Наложен платеж",
    tracking_type: "Tag or API",
    source: "Препоръка: Mail.bg",
    points: 156,
    documents: "Поръчка #0000001189",
    waybill: "Speedy #1013599901",
    export_status: "Tag or API",
    billing: {
      first_name: "Кирил",
      last_name: "Георгиев",
      email: "kiril.georgiev@mail.bg",
      phone: "+359887654321",
      city: "Пловдив",
      country: "BG"
    },
    shipping: {
      first_name: "Кирил",
      last_name: "Георгиев",
      city: "Пловдив",
      country: "BG"
    },
    line_items: [
      {
        id: 204,
        name: "Фотополимерна лампа LED Wireless Dental",
        product_id: 8840,
        quantity: 1,
        price: 155.98,
        subtotal: "155.98",
        total: "155.98",
        sku: "LED-LAMP-W"
      }
    ]
  },
  {
    id: 43723,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-27T16:45:00",
    total: "23.00",
    total_tax: "3.83",
    payment_method: "bacs",
    payment_method_title: "Банков превод",
    tracking_type: "Tag or API",
    source: "Източник: Google",
    points: 23,
    documents: "Поръчка #0000001188",
    waybill: "—",
    export_status: "Tag or API",
    billing: {
      first_name: "Kiril",
      last_name: "Sarandaliev",
      email: "k.sarandaliev@dent-clinic.bg",
      phone: "+359899112233",
      city: "Благоевград",
      country: "BG"
    },
    shipping: {
      first_name: "Kiril",
      last_name: "Sarandaliev",
      city: "Благоевград",
      country: "BG"
    },
    line_items: [
      {
        id: 205,
        name: "Ендодонтски пили Niti Flex 25mm 6 бр",
        product_id: 9104,
        quantity: 1,
        price: 23.00,
        subtotal: "23.00",
        total: "23.00",
        sku: "ENDO-FILE-25"
      }
    ]
  },
  {
    id: 43721,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-27T14:12:00",
    total: "127.58",
    total_tax: "21.26",
    payment_method: "stripe",
    payment_method_title: "Карта (Stripe)",
    tracking_type: "Tag or API",
    source: "Източник: Google",
    points: 128,
    documents: "Поръчка #0000001187",
    waybill: "Speedy #1013597711",
    export_status: "Tag or API",
    billing: {
      first_name: "Ренета",
      last_name: "Попова",
      email: "reneta.popova@gmail.com",
      phone: "+359885443322",
      city: "Бургас",
      country: "BG"
    },
    shipping: {
      first_name: "Ренета",
      last_name: "Попова",
      city: "Бургас",
      country: "BG"
    },
    line_items: [
      {
        id: 206,
        name: "Композит Филотек Нано А2 4g",
        product_id: 1102,
        quantity: 2,
        price: 63.79,
        subtotal: "127.58",
        total: "127.58",
        sku: "COMP-NANO-A2"
      }
    ]
  },
  {
    id: 43718,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-27T11:05:00",
    total: "28.32",
    total_tax: "4.72",
    payment_method: "cod",
    payment_method_title: "Наложен платеж",
    tracking_type: "Tag or API",
    source: "Препоръка: Bing.com",
    points: 28,
    documents: "Поръчка #0000001186",
    waybill: "—",
    export_status: "Tag or API",
    billing: {
      first_name: "Симона",
      last_name: "Лазарова",
      email: "simona.lazarova@yahoo.com",
      phone: "+359883998877",
      city: "Русе",
      country: "BG"
    },
    shipping: {
      first_name: "Симона",
      last_name: "Лазарова",
      city: "Русе",
      country: "BG"
    },
    line_items: [
      {
        id: 207,
        name: "Дезинфектант за медицински инструменти 1L",
        product_id: 3301,
        quantity: 1,
        price: 28.32,
        subtotal: "28.32",
        total: "28.32",
        sku: "DES-INST-1L"
      }
    ]
  },
  {
    id: 43716,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-26T18:22:00",
    total: "16.95",
    total_tax: "2.83",
    payment_method: "cod",
    payment_method_title: "Наложен платеж",
    tracking_type: "Tag or API",
    source: "Източник: Banner",
    points: 17,
    documents: "Поръчка #0000001185",
    waybill: "—",
    export_status: "Tag or API",
    billing: {
      first_name: "Анелия",
      last_name: "Вълчева",
      email: "anelia.valcheva@abv.bg",
      phone: "+359882114455",
      city: "Стара Загора",
      country: "BG"
    },
    shipping: {
      first_name: "Анелия",
      last_name: "Вълчева",
      city: "Стара Загора",
      country: "BG"
    },
    line_items: [
      {
        id: 208,
        name: "Матрични ленти метални 50 бр",
        product_id: 4410,
        quantity: 1,
        price: 16.95,
        subtotal: "16.95",
        total: "16.95",
        sku: "MAT-STRIP-50"
      }
    ]
  },
  {
    id: 43713,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-26T15:10:00",
    total: "183.61",
    total_tax: "30.60",
    payment_method: "stripe",
    payment_method_title: "Карта (Stripe)",
    tracking_type: "Tag or API",
    source: "Източник: Google",
    points: 184,
    documents: "Поръчка #0000001184",
    waybill: "Speedy #1013595500",
    export_status: "Tag or API",
    billing: {
      first_name: "Георги",
      last_name: "Киримов",
      email: "georgi.kirimov@dental-bg.com",
      phone: "+359897223344",
      city: "Варна",
      country: "BG"
    },
    shipping: {
      first_name: "Георги",
      last_name: "Киримов",
      city: "Варна",
      country: "BG"
    },
    line_items: [
      {
        id: 209,
        name: "Ултразвуков скалер наконечник Dental Pro",
        product_id: 1502,
        quantity: 1,
        price: 183.61,
        subtotal: "183.61",
        total: "183.61",
        sku: "SCALER-PRO-UL"
      }
    ]
  },
  {
    id: 43711,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-25T20:15:00",
    total: "73.42",
    total_tax: "12.24",
    payment_method: "cod",
    payment_method_title: "Наложен платеж",
    tracking_type: "Tag or API",
    source: "Органични: Google",
    points: 73,
    documents: "Поръчка #0000001183",
    waybill: "—",
    export_status: "Tag or API",
    billing: {
      first_name: "Denislav",
      last_name: "Stoyanov",
      email: "denislav@med-care.bg",
      phone: "+359886556677",
      city: "Велико Търново",
      country: "BG"
    },
    shipping: {
      first_name: "Denislav",
      last_name: "Stoyanov",
      city: "Велико Търново",
      country: "BG"
    },
    line_items: [
      {
        id: 210,
        name: "Артикулационна хартия синя/червена 200 листа",
        product_id: 2201,
        quantity: 2,
        price: 36.71,
        subtotal: "73.42",
        total: "73.42",
        sku: "ART-PAPER-200"
      }
    ]
  },
  {
    id: 43709,
    status: "processing",
    currency: "EUR",
    date_created: "2026-07-25T14:30:00",
    total: "230.55",
    total_tax: "38.43",
    payment_method: "bacs",
    payment_method_title: "Банков превод",
    tracking_type: "Tag or API",
    source: "Директна",
    points: 231,
    documents: "Поръчка #0000001182",
    waybill: "Speedy #1013594411",
    export_status: "Tag or API",
    billing: {
      first_name: "Нихаил",
      last_name: "Ахмед",
      email: "nihail.ahmed@clinic.bg",
      phone: "+359895889900",
      city: "Кърджали",
      country: "BG"
    },
    shipping: {
      first_name: "Нихаил",
      last_name: "Ахмед",
      city: "Кърджали",
      country: "BG"
    },
    line_items: [
      {
        id: 211,
        name: "Стоматологичен микромотор турбинен Kavo type",
        product_id: 9912,
        quantity: 1,
        price: 230.55,
        subtotal: "230.55",
        total: "230.55",
        sku: "TURB-MIC-KAVO"
      }
    ]
  },
  {
    id: 43707,
    status: "completed",
    currency: "EUR",
    date_created: "2026-07-24T12:15:00",
    total: "64.61",
    total_tax: "10.77",
    payment_method: "cod",
    payment_method_title: "Наложен платеж",
    tracking_type: "Advanced Purchase",
    source: "Източник: Releva",
    points: 65,
    documents: "Поръчка #0000001181",
    waybill: "Speedy #1013591100",
    export_status: "Advanced Purchase",
    billing: {
      first_name: "Гергана",
      last_name: "Гургурова",
      email: "g.gurgurova@abv.bg",
      phone: "+359884332211",
      city: "Казанлък",
      country: "BG"
    },
    shipping: {
      first_name: "Гергана",
      last_name: "Гургурова",
      city: "Казанлък",
      country: "BG"
    },
    line_items: [
      {
        id: 212,
        name: "Зъболекарски игли за анестезия 30G 100 бр",
        product_id: 6109,
        quantity: 1,
        price: 64.61,
        subtotal: "64.61",
        total: "64.61",
        sku: "NEEDLE-30G-100"
      }
    ]
  },
  {
    id: 43751,
    status: "pending",
    currency: "EUR",
    date_created: "2026-08-19T18:51:00",
    total: "145.00",
    total_tax: "24.16",
    payment_method: "bacs",
    payment_method_title: "Плащане с карта, Apple Pay",
    tracking_type: "Tag or API",
    source: "Източник: Google",
    points: 145,
    documents: "Поръчка #0000001192",
    waybill: "—",
    export_status: "Tag or API",
    billing: {
      first_name: "Бетина",
      last_name: "Христова",
      email: "hejakt38979@ittiv.com",
      phone: "+359881112233",
      city: "София",
      country: "BG"
    },
    shipping: {
      first_name: "Бетина",
      last_name: "Христова",
      city: "София",
      country: "BG"
    },
    line_items: [
      {
        id: 213,
        name: "Стоматологичен комплексен сет",
        product_id: 9940,
        quantity: 1,
        price: 145.00,
        subtotal: "145.00",
        total: "145.00",
        sku: "DENT-SET-145"
      }
    ]
  },
  {
    id: 43753,
    status: "on-hold",
    currency: "EUR",
    date_created: "2026-08-19T19:30:00",
    total: "82.50",
    total_tax: "13.75",
    payment_method: "cod",
    payment_method_title: "Наложен платеж",
    tracking_type: "Tag or API",
    source: "Препоръка: Bing.com",
    points: 83,
    documents: "Поръчка #0000001193",
    waybill: "—",
    export_status: "Tag or API",
    billing: {
      first_name: "Бетина",
      last_name: "Христова",
      email: "dr.betinahristova.bsmile@gmail.com",
      phone: "+359882223344",
      city: "Варна",
      country: "BG"
    },
    shipping: {
      first_name: "Бетина",
      last_name: "Христова",
      city: "Варна",
      country: "BG"
    },
    line_items: [
      {
        id: 214,
        name: "Медицински предпазни консумативи",
        product_id: 8812,
        quantity: 1,
        price: 82.50,
        subtotal: "82.50",
        total: "82.50",
        sku: "MED-PROT-82"
      }
    ]
  }
]
