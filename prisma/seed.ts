import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

type TeamKey = "men" | "youth" | "women" | "paralympic";

type SeedPlayer = {
  id: string;
  name: string;
  number: string;
  image: string;
};

type SeedTeam = {
  key: TeamKey;
  title: string;
  coach: string;
  description: string;
  players: SeedPlayer[];
};

const TEAMS: SeedTeam[] = [
  {
    key: "men",
    title: "المنتخب الأول للرجال",
    coach: "يورغن بيرسون",
    description: "تعرف على تشكيلة المنتخب ولاعبيه المميزين",
    players: [
      {
        id: "m1",
        name: "علي الخضراوي",
        number: "1",
        image: "/images/players/player-1.png",
      },
      {
        id: "m2",
        name: "سالم السويلم",
        number: "2",
        image: "/images/players/player-2.png",
      },
      {
        id: "m3",
        name: "خالد الشريف",
        number: "3",
        image: "/images/players/player-3.png",
      },
      {
        id: "m4",
        name: "عبدالعزيز بوشليبي",
        number: "4",
        image: "/images/players/player-4.png",
      },
    ],
  },
  {
    key: "youth",
    title: "منتخب الفئات السنية",
    coach: "يوسف ربيع",
    description: "تعرف على تشكيلة الشباب ولاعبيه المميزين",
    players: [
      {
        id: "y1",
        name: "سعود الطاهر",
        number: "5",
        image: "/images/players/youth-1.png",
      },
      {
        id: "y2",
        name: "عبدالرحمن الطاهر",
        number: "6",
        image: "/images/players/youth-2.png",
      },
      {
        id: "y3",
        name: "علي خضراوي",
        number: "7",
        image: "/images/players/youth-3.png",
      },
      {
        id: "y4",
        name: "يوسف حنيفة",
        number: "8",
        image: "/images/players/youth-4.png",
      },
      {
        id: "y5",
        name: "ريان المنجومي",
        number: "9",
        image: "/images/players/youth-5.png",
      },
      {
        id: "y6",
        name: "فارس الطاهر",
        number: "10",
        image: "/images/players/youth-6.png",
      },
      {
        id: "y7",
        name: "علي خضراوي",
        number: "11",
        image: "/images/players/youth-7.png",
      },
      {
        id: "y8",
        name: "احمد الخلف",
        number: "12",
        image: "/images/players/youth-8.png",
      },
    ],
  },
  {
    key: "women",
    title: "منتخب السيدات",
    coach: "مراد يوسف",
    description: "تعرف على تشكيلة المنتخب ولاعباته المميزات",
    players: [
      {
        id: "w1",
        name: "نهال القحطاني",
        number: "13",
        image: "/images/players/women-1.png",
      },
      {
        id: "w2",
        name: "اميرة الظفيري",
        number: "14",
        image: "/images/players/women-2.png",
      },
      {
        id: "w3",
        name: "نوز باجحزر",
        number: "15",
        image: "/images/players/women-3.png",
      },
      {
        id: "w4",
        name: "حصة الخالدي",
        number: "16",
        image: "/images/players/women-4.png",
      },
    ],
  },
  {
    key: "paralympic",
    title: "منتخب البارالمبية",
    coach: "حسام الشوبري - زهراء الغرابي",
    description: "تعرف على تشكيلة المنتخب ولاعبيه المميزين",
    players: [
      {
        id: "p1",
        name: "مريم المريسل",
        number: "17",
        image: "/images/players/para-1.png",
      },
      {
        id: "p2",
        name: "زهراء آلطالع",
        number: "18",
        image: "/images/players/para-2.png",
      },
      {
        id: "p3",
        name: "علي خضراوي",
        number: "19",
        image: "/images/players/para-3.png",
      },
      {
        id: "p4",
        name: "ابراهيم الحسن",
        number: "20",
        image: "/images/players/para-4.png",
      },
    ],
  },
];

type SeedPartner = {
  src: string;
  alt: string;
};

const PARTNER_LOGOS: SeedPartner[] = [
  { src: "/homePage/logo1.png", alt: "شريك 1" },
  { src: "/homePage/logo2.png", alt: "شريك 2" },
  { src: "/homePage/logo3.png", alt: "شريك 3" },
  { src: "/homePage/logo4.png", alt: "شريك 4" },
  { src: "/homePage/logo5.png", alt: "شريك 5" },
  { src: "/homePage/logo6.png", alt: "شريك 6" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserAlreadyExistsError(error: unknown) {
  if (!isRecord(error)) {
    return false;
  }

  const directMessage = error.message;
  const body = error.body;

  if (
    typeof directMessage === "string" &&
    directMessage.toLowerCase().includes("user already exists")
  ) {
    return true;
  }

  if (isRecord(body)) {
    const bodyMessage = body.message;
    const bodyCode = body.code;

    if (
      typeof bodyMessage === "string" &&
      bodyMessage.toLowerCase().includes("user already exists")
    ) {
      return true;
    }

    if (
      typeof bodyCode === "string" &&
      bodyCode === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
    ) {
      return true;
    }
  }

  return false;
}

async function seedAdminUser() {
  try {
    await auth.api.signUpEmail({
      body: {
        name: "STTF Admin",
        email: "admin@sttf.com",
        password: "ChangeThisPassword123!",
      },
    });

    console.log("Admin user created.");
  } catch (error: unknown) {
    if (isUserAlreadyExistsError(error)) {
      console.log("Admin user already exists. Skipping admin creation.");
      return;
    }

    throw error;
  }
}

async function seedNationalTeams() {
  for (const [teamIndex, team] of TEAMS.entries()) {
    const savedTeam = await prisma.nationalTeam.upsert({
      where: {
        category: team.key,
      },
      update: {
        title: team.title,
        coach: team.coach,
        description: team.description,
        published: true,
        order: teamIndex,
      },
      create: {
        category: team.key,
        title: team.title,
        coach: team.coach,
        description: team.description,
        published: true,
        order: teamIndex,
      },
      select: {
        id: true,
        title: true,
      },
    });

    await prisma.nationalTeamPlayer.deleteMany({
      where: {
        teamId: savedTeam.id,
      },
    });

    await prisma.nationalTeamPlayer.createMany({
      data: team.players.map((player: SeedPlayer, playerIndex: number) => ({
        name: player.name,
        number: player.number,
        image: player.image,
        order: playerIndex,
        teamId: savedTeam.id,
      })),
    });

    console.log(`Seeded team: ${savedTeam.title}`);
  }
}

async function seedPartners() {
  const partnerImages = PARTNER_LOGOS.map((partner: SeedPartner) => partner.src);

  await prisma.partner.deleteMany({
    where: {
      image: {
        in: partnerImages,
      },
    },
  });

  await prisma.partner.createMany({
    data: PARTNER_LOGOS.map((partner: SeedPartner, partnerIndex: number) => ({
      name: partner.alt,
      image: partner.src,
      published: true,
      order: partnerIndex,
    })),
  });

  console.log("Seeded partner logos.");
}

async function main() {
  await seedAdminUser();
  await seedNationalTeams();
  await seedPartners();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (error: unknown) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });