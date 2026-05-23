// Bilingual translations + business data
export const PHONE_WHATSAPP = "525560326688"; // wa.me format (no plus)
export const PHONE_DISPLAY = "+52 55 6032 6688";
export const ADDRESS = "Gotcha Los Patos, 52743 La Marquesa, Méx.";
export const ADDRESS_SHORT = "La Marquesa, Estado de México";
export const MAPS_QUERY = "Gotcha Los Patos 52743 La Marquesa";
export const DEPOSIT = 300;

export const LOGO_URL = "https://customer-assets.emergentagent.com/job_gotcha-paintball-3d/artifacts/xkq8qnpn_WhatsApp%20Image%202026-04-26%20at%2010.06.42%20PM.jpeg";

export const YOUTUBE_VIDEO_ID = "rmyjE2m0Vjg";
export const YOUTUBE_URL = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`;

export const SOCIAL_LINKS = {
    facebook: "https://www.facebook.com/profile.php?id=61588822287168",
    instagram: "https://www.instagram.com/gotcha_lospatos/",
    tiktok: "https://www.tiktok.com/@gotchalospatos",
};

export const GALLERY_PHOTOS = [
    {
        url: "https://customer-assets.emergentagent.com/job_gotcha-paintball-3d/artifacts/3gqxhika_WhatsApp%20Image%202026-04-26%20at%2010.06.57%20PM.jpeg",
        captionEs: "Equipo táctico listo para la batalla",
        captionEn: "Tactical squad ready for battle",
        tag: "SQUAD",
    },
    {
        url: "https://customer-assets.emergentagent.com/job_gotcha-paintball-3d/artifacts/vrw8nk1v_WhatsApp%20Image%202026-04-26%20at%2010.06.56%20PM.jpeg",
        captionEs: "Grupo grande disfrutando del bosque",
        captionEn: "Big group enjoying the forest",
        tag: "EVENTOS",
    },
    {
        url: "https://customer-assets.emergentagent.com/job_gotcha-paintball-3d/artifacts/89wiirqp_WhatsApp%20Image%202026-04-26%20at%209.19.37%20PM.jpeg",
        captionEs: "Cumpleaños y celebraciones únicas",
        captionEn: "Unique birthdays and celebrations",
        tag: "CUMPLEAÑOS",
    },
    {
        url: "https://customer-assets.emergentagent.com/job_gotcha-paintball-3d/artifacts/s10tc28g_WhatsApp%20Image%202026-04-26%20at%209.20.06%20PM.jpeg",
        captionEs: "Equipo profesional, bosque real",
        captionEn: "Pro gear, real forest",
        tag: "PRO",
    },
    {
        url: "https://customer-assets.emergentagent.com/job_gotcha-paintball-3d/artifacts/9qkcmn5s_WhatsApp%20Image%202026-04-26%20at%209.19.36%20PM%20%282%29.jpeg",
        captionEs: "Adrenalina y humo de color",
        captionEn: "Adrenaline and colored smoke",
        tag: "EFECTOS",
    },
    {
        url: "https://customer-assets.emergentagent.com/job_gotcha-paintball-3d/artifacts/mexmm9w7_WhatsApp%20Image%202026-04-25%20at%202.26.27%20PM.jpeg",
        captionEs: "Diversión sin límites: gotcha, cuatrimotos, paseos, tirolesa",
        captionEn: "Limitless fun: paintball, ATVs, horseback, ziplines",
        tag: "ACTIVIDADES",
    },
    {
        url: "https://customer-assets.emergentagent.com/job_gotcha-paintball-3d/artifacts/osvow0yj_WhatsApp%20Image%202026-05-01%20at%207.52.05%20PM.jpeg",
        captionEs: "Promo $2,800 ideal empresas y fiestas",
        captionEn: "$2,800 promo - perfect for companies and parties",
        tag: "PROMO",
    },
];

// Horario en minutos desde medianoche para validar slots
// Slots por hora cerrada
export const TIME_SLOTS_WEEKDAY = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]; // L-V 10am-6pm
export const TIME_SLOTS_WEEKEND = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]; // S-D 10am-6pm

export const PACKAGES_INDIVIDUAL = [
    {
        id: "ind_1",
        nameEs: "PAQUETE 1",
        nameEn: "PACKAGE 1",
        price: 160,
        balls: 100,
        featuresEs: ["Chaleco táctico", "Careta de protección", "100 balas incluidas"],
        featuresEn: ["Tactical vest", "Safety mask", "100 paintballs included"],
        accent: "neon-green",
        tag: "BÁSICO",
    },
    {
        id: "ind_2",
        nameEs: "PAQUETE 2",
        nameEn: "PACKAGE 2",
        price: 190,
        balls: 110,
        featuresEs: ["OVEROL completo", "Chaleco táctico", "Careta de protección", "110 balas incluidas"],
        featuresEn: ["Full coveralls", "Tactical vest", "Safety mask", "110 paintballs included"],
        accent: "neon-orange",
        tag: "POPULAR",
        highlight: true,
    },
    {
        id: "ind_3",
        nameEs: "PAQUETE 3",
        nameEn: "PACKAGE 3",
        price: 240,
        balls: 150,
        featuresEs: ["OVEROL completo", "Chaleco táctico", "Careta de protección", "GUANTES de protección", "150 balas incluidas"],
        featuresEn: ["Full coveralls", "Tactical vest", "Safety mask", "Protection gloves", "150 paintballs included"],
        accent: "neon-magenta",
        tag: "PRO",
    },
];

export const PACKAGES_FAMILY = [
    {
        id: "fam_1",
        nameEs: "PAQUETE FAMILIAR 1",
        nameEn: "FAMILY PACKAGE 1",
        price: 2500,
        people: 10,
        balls: 2000,
        featuresEs: ["Hasta 10 personas", "Chalecos tácticos", "Caretas de protección", "2,000 balas incluidas"],
        featuresEn: ["Up to 10 people", "Tactical vests", "Safety masks", "2,000 paintballs included"],
        accent: "neon-green",
    },
    {
        id: "fam_2",
        nameEs: "PAQUETE FAMILIAR 2",
        nameEn: "FAMILY PACKAGE 2",
        price: 2800,
        people: 10,
        balls: 2000,
        featuresEs: ["Hasta 10 personas", "Chalecos tácticos", "Caretas de protección", "OVEROLES completos", "GUANTES de protección", "2,000 balas incluidas"],
        featuresEn: ["Up to 10 people", "Tactical vests", "Safety masks", "Full coveralls", "Protection gloves", "2,000 paintballs included"],
        accent: "neon-orange",
        tag: "MÁS PEDIDO",
        highlight: true,
    },
    {
        id: "fam_3",
        nameEs: "PAQUETE FAMILIAR 3",
        nameEn: "FAMILY PACKAGE 3",
        price: 5200,
        people: 16,
        balls: 4000,
        featuresEs: ["Hasta 16 personas", "Chalecos tácticos", "Caretas de protección", "OVEROLES completos", "GUANTES de protección", "4,000 balas incluidas"],
        featuresEn: ["Up to 16 people", "Tactical vests", "Safety masks", "Full coveralls", "Protection gloves", "4,000 paintballs included"],
        accent: "neon-magenta",
        tag: "EVENTOS",
    },
];

export const TESTIMONIALS = [
    {
        name: "Carlos Mendoza",
        rating: 5,
        es: "¡Excelente lugar para pasar el fin de semana! Fui con mi familia y agarramos el Paquete Familiar 2. Nos dieron overoles completos y guantes, lo cual se agradece muchísimo para no manchar la ropa. Las caretas en muy buen estado y el campo está increíble, en pleno bosque de La Marquesa. Muy recomendable.",
        en: "Awesome place for the weekend! I went with my family and got Family Package 2. They gave us full coveralls and gloves, which we really appreciated to keep our clothes clean. Masks were in great shape and the field is amazing, deep inside La Marquesa forest. Highly recommended.",
        tag: "FAMILIAR",
    },
    {
        name: "Mariana Ríos",
        rating: 5,
        es: "Súper experiencia y a muy buen precio. Compramos el paquete de $190 con 110 balas y nos rindió perfecto para un buen rato de adrenalina. El personal te explica muy bien las reglas de seguridad. Definitivamente el mejor gotcha a minutos de la CDMX. ¡Vamos a volver!",
        en: "Super experience at a great price. We got the $190 package with 110 paintballs and it was perfect for a solid adrenaline session. The staff carefully explained the safety rules. Definitely the best paintball minutes from CDMX. We'll be back!",
        tag: "PAREJA",
    },
    {
        name: 'Diego "El Jefe" Aguilar',
        rating: 5,
        es: "Armamos la reta con los del trabajo y pedimos el paquete para 16 personas. Las 4,000 balas fueron más que suficientes para armar unas buenas retas. El equipo táctico está de lujo y el ambiente en el bosque le da un toque mucho más realista al juego. 10/10.",
        en: "We organized a match with my coworkers and got the 16-person package. 4,000 paintballs were more than enough for several rounds. Tactical gear is top-notch and the forest setting makes it feel ultra realistic. 10/10.",
        tag: "GRUPO",
    },
    {
        name: "Fernanda López",
        rating: 5,
        es: "Fui el domingo a mediodía y nos atendieron súper rápido. Me encantó que los paquetes ya incluyen el chaleco y la careta desde el más básico ($160). El terreno es amplio, con buenas trincheras y muy seguro. Ideal para sacar el estrés de la semana.",
        en: "We went on a Sunday at noon and got served super fast. Loved that even the basic $160 pack already includes vest and mask. Big terrain, great trenches and super safe. Perfect to release weekly stress.",
        tag: "WEEKEND",
    },
    {
        name: "Roberto Sánchez",
        rating: 5,
        es: "Llevo años jugando gotcha en diferentes lugares y 'Los Patos' es de mis favoritos por la ubicación. Llegas de volada desde la ciudad y el clima de La Marquesa es perfecto para no morir de calor mientras corres con el overol y la máscara. Excelente atención y el equipo funciona al cien, sin fallas en las marcadoras.",
        en: "I've played paintball for years at different fields and 'Los Patos' is one of my favorites because of the location. You get there fast from the city and the La Marquesa weather is perfect so you don't melt running in coveralls and mask. Excellent service and the markers run flawlessly.",
        tag: "VETERANO",
    },
];

export const SCHEDULE = {
    es: [
        { days: "Lunes a Viernes", hours: "10:00 AM - 6:00 PM" },
        { days: "Sábados y Domingos", hours: "10:00 AM - 6:00 PM" },
    ],
    en: [
        { days: "Monday to Friday", hours: "10:00 AM - 6:00 PM" },
        { days: "Saturday & Sunday", hours: "10:00 AM - 6:00 PM" },
    ],
};

export const T = {
    es: {
        nav: { packages: "PAQUETES", info: "INFO", gallery: "GALERÍA", video: "VIDEO", testimonials: "RESEÑAS", contact: "CONTACTO", personal: "PERSONAL", book: "RESERVAR" },
        hero: {
            badge: "PAINTBALL TÁCTICO · LA MARQUESA",
            titleA: "DESATA",
            titleB: "TU INSTINTO",
            titleC: "DE GUERRA",
            subtitle: "La mejor experiencia táctica a solo minutos de la Ciudad de México. Bosque real, equipo profesional, adrenalina pura.",
            cta: "RESERVAR AHORA",
            cta2: "VER PAQUETES",
            stats: [
                { value: "+5,000", label: "Jugadores Felices" },
                { value: "8", label: "Años de Experiencia" },
                { value: "30 min", label: "Desde la CDMX" },
                { value: "100%", label: "Equipo Profesional" },
            ],
        },
        info: {
            kicker: "EL CAMPO DE BATALLA",
            title: "ENTRA AL BOSQUE.\nSAL HÉROE.",
            body: "Más de una hectárea de bosque real en La Marquesa, trincheras tácticas, búnkers de madera y árboles centenarios. Cada partida es una misión distinta. Cada disparo, una historia.",
            scheduleTitle: "HORARIOS DE OPERACIÓN",
            locationTitle: "UBICACIÓN",
            locationCopy: "La Marquesa, Estado de México · A 30 min de la CDMX por la México-Toluca",
        },
        packages: {
            kickerInd: "PARA UNO O EN PAREJA",
            titleInd: "PAQUETES INDIVIDUALES",
            kickerFam: "EQUIPOS · CUMPLEAÑOS · EVENTOS",
            titleFam: "PAQUETES FAMILIARES Y GRUPOS",
            cta: "RESERVAR AHORA",
            ctaGroup: "RESERVAR GRUPO",
            balls: "balas",
            people: "personas",
            mxn: "MXN por persona",
            mxnGroup: "MXN total",
        },
        booking: {
            title: "RESERVA TU MISIÓN",
            subtitle: "Asegura tu lugar con solo $300 MXN de anticipo. El restante lo pagas el día de tu visita.",
            name: "Nombre completo",
            phone: "Teléfono / WhatsApp",
            email: "Email (opcional)",
            participants: "Número de participantes",
            date: "Fecha",
            time: "Horario",
            timePlaceholder: "Selecciona un horario",
            slotTaken: "ocupado",
            slotAvailable: "disponible",
            noSlotsToday: "No hay horarios disponibles para esta fecha. Elige otro día.",
            timeConflict: "Ese horario ya está ocupado. Por favor elige otro.",
            notes: "Notas adicionales",
            depositLabel: "Anticipo a pagar hoy",
            totalLabel: "Total del paquete",
            remainingLabel: "Pagar el día de la visita",
            confirm: "CONFIRMAR Y CONTACTAR POR WHATSAPP",
            sending: "ENVIANDO...",
            successTitle: "¡Reserva registrada!",
            successBody: "Te contactaremos por WhatsApp para confirmar el anticipo de $300 MXN.",
            error: "Hubo un problema. Intenta de nuevo o contáctanos por WhatsApp.",
        },
        testimonials: {
            kicker: "VOCES DEL CAMPO",
            title: "RESEÑAS DE NUESTROS GUERREROS",
        },
        gallery: {
            kicker: "EL CAMPO EN ACCIÓN",
            title: "ASÍ SE VIVE EN EL BOSQUE",
            subtitle: "Fotos reales de nuestros guerreros disfrutando la mejor experiencia táctica.",
        },
        videoSection: {
            kicker: "MIRA EL CAMPO EN VIVO",
            title: "EXPERIENCIA EN VIDEO",
            subtitle: "Conoce nuestro campo, nuestro equipo y la diversión que vivirás en Gotcha Los Patos.",
        },
        cta: {
            title: "¿LISTO PARA EL COMBATE?",
            subtitle: "Reserva con $300 MXN. Vive la mejor batalla de tu vida.",
            book: "RESERVAR AHORA",
            whatsapp: "WHATSAPP DIRECTO",
        },
        footer: {
            tagline: "Paintball Táctico en el Bosque",
            quickLinks: "Acceso rápido",
            contact: "Contacto",
            follow: "Síguenos",
            rights: "Todos los derechos reservados.",
            adminLink: "Acceso staff",
        },
        admin: {
            title: "PANEL DE PERSONAL",
            login: "ACCESO PERSONAL",
            email: "Email o Usuario",
            password: "Contraseña",
            enter: "ENTRAR",
            logout: "Cerrar sesión",
            hint: "Solo personal autorizado.",
        },
    },
    en: {
        nav: { packages: "PACKAGES", info: "INFO", gallery: "GALLERY", video: "VIDEO", testimonials: "REVIEWS", contact: "CONTACT", personal: "STAFF", book: "BOOK" },
        hero: {
            badge: "TACTICAL PAINTBALL · LA MARQUESA",
            titleA: "UNLEASH",
            titleB: "YOUR WAR",
            titleC: "INSTINCT",
            subtitle: "The best tactical experience just minutes from Mexico City. Real forest, pro gear, pure adrenaline.",
            cta: "BOOK NOW",
            cta2: "SEE PACKAGES",
            stats: [
                { value: "+5,000", label: "Happy Players" },
                { value: "8", label: "Years of Experience" },
                { value: "30 min", label: "From CDMX" },
                { value: "100%", label: "Pro Equipment" },
            ],
        },
        info: {
            kicker: "THE BATTLEFIELD",
            title: "ENTER THE FOREST.\nLEAVE A HERO.",
            body: "Over one hectare of real forest in La Marquesa, tactical trenches, wooden bunkers and century-old trees. Each match is a new mission. Every shot, a story.",
            scheduleTitle: "OPERATION HOURS",
            locationTitle: "LOCATION",
            locationCopy: "La Marquesa, State of Mexico · 30 min from CDMX via the Mexico-Toluca highway",
        },
        packages: {
            kickerInd: "SOLO OR DUO",
            titleInd: "INDIVIDUAL PACKAGES",
            kickerFam: "TEAMS · BIRTHDAYS · EVENTS",
            titleFam: "FAMILY & GROUP PACKAGES",
            cta: "BOOK NOW",
            ctaGroup: "BOOK GROUP",
            balls: "paintballs",
            people: "people",
            mxn: "MXN per person",
            mxnGroup: "MXN total",
        },
        booking: {
            title: "BOOK YOUR MISSION",
            subtitle: "Lock your spot with only $300 MXN deposit. Pay the rest on the day of your visit.",
            name: "Full name",
            phone: "Phone / WhatsApp",
            email: "Email (optional)",
            participants: "Number of participants",
            date: "Date",
            time: "Time",
            timePlaceholder: "Pick a time slot",
            slotTaken: "booked",
            slotAvailable: "available",
            noSlotsToday: "No available slots for this date. Pick another day.",
            timeConflict: "That time slot is already booked. Please pick another.",
            notes: "Additional notes",
            depositLabel: "Deposit due today",
            totalLabel: "Package total",
            remainingLabel: "Pay on visit day",
            confirm: "CONFIRM & CHAT ON WHATSAPP",
            sending: "SENDING...",
            successTitle: "Booking saved!",
            successBody: "We'll reach you on WhatsApp to confirm the $300 MXN deposit.",
            error: "Something went wrong. Try again or message us on WhatsApp.",
        },
        testimonials: {
            kicker: "VOICES FROM THE FIELD",
            title: "OUR WARRIORS' REVIEWS",
        },
        gallery: {
            kicker: "THE FIELD IN ACTION",
            title: "THIS IS LIFE IN THE FOREST",
            subtitle: "Real photos of our warriors enjoying the best tactical experience.",
        },
        videoSection: {
            kicker: "WATCH THE FIELD LIVE",
            title: "VIDEO EXPERIENCE",
            subtitle: "Get to know our field, our team and the fun you'll live at Gotcha Los Patos.",
        },
        cta: {
            title: "READY FOR COMBAT?",
            subtitle: "Lock it in with a $300 MXN deposit. Live the best battle of your life.",
            book: "BOOK NOW",
            whatsapp: "DIRECT WHATSAPP",
        },
        footer: {
            tagline: "Tactical Forest Paintball",
            quickLinks: "Quick links",
            contact: "Contact",
            follow: "Follow us",
            rights: "All rights reserved.",
            adminLink: "Staff access",
        },
        admin: {
            title: "BOOKINGS DASHBOARD",
            login: "ADMIN ACCESS",
            email: "Email",
            password: "Password",
            enter: "ENTER",
            logout: "Log out",
        },
    },
};
