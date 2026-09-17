import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEED_SUBJECTS } from "./seed-data/subjects";
import { SEED_ROADMAPS } from "./seed-data/roadmap";
import { SEED_GRADE_ROADMAPS } from "./seed-data/grade-roadmaps";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@netkoc.app";
  const password = process.env.ADMIN_PASSWORD ?? "netkoc-admin-change-me";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] Platform admin zaten var: ${email}`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: "Platform Admin",
      role: "PLATFORM_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`[seed] Platform admin olusturuldu: ${email}`);
}

async function seedSubjects() {
  for (const subject of SEED_SUBJECTS) {
    const existing = await prisma.subject.findFirst({
      where: { orgId: null, code: subject.code },
    });
    let subjectId: string;
    if (existing) {
      subjectId = existing.id;
      await prisma.subject.update({
        where: { id: existing.id },
        data: {
          name: subject.name,
          level: subject.level,
          tracks: subject.tracks,
          order: subject.order,
        },
      });
    } else {
      const created = await prisma.subject.create({
        data: {
          orgId: null,
          code: subject.code,
          name: subject.name,
          level: subject.level,
          tracks: subject.tracks,
          order: subject.order,
        },
      });
      subjectId = created.id;
    }

    // Topics
    for (const t of subject.topics) {
      const existingTopic = await prisma.topic.findFirst({
        where: { subjectId, name: t.name },
      });
      if (existingTopic) {
        await prisma.topic.update({
          where: { id: existingTopic.id },
          data: { level: t.level, order: t.order },
        });
      } else {
        await prisma.topic.create({
          data: { subjectId, name: t.name, level: t.level, order: t.order },
        });
      }
    }
  }
  console.log(`[seed] ${SEED_SUBJECTS.length} ders + konulari yuklendi`);
}

async function seedRoadmaps() {
  const systemSubjects = await prisma.subject.findMany({ where: { orgId: null } });
  const subjectMap = new Map(systemSubjects.map((s) => [s.code, s.id]));

  for (const roadmap of [...SEED_ROADMAPS, ...SEED_GRADE_ROADMAPS]) {
    const existingTpl = await prisma.roadmapTemplate.findFirst({
      where: {
        orgId: null,
        track: roadmap.track,
        year: roadmap.year,
        scope: roadmap.scope ?? "YKS",
        isSystem: true,
      },
    });
    if (existingTpl) {
      console.log(`[seed] Sistem sablonu duruyor, silinmedi: ${existingTpl.name}`);
      continue;
    }
    const tpl = await prisma.roadmapTemplate.create({
      data: {
        orgId: null,
        name: roadmap.name,
        year: roadmap.year,
        track: roadmap.track,
        scope: roadmap.scope ?? "YKS",
        isSystem: true,
      },
    });
    for (const w of roadmap.weeks) {
      const week = await prisma.roadmapWeek.create({
        data: {
          templateId: tpl.id,
          monthIndex: w.monthIndex,
          weekIndex: w.weekIndex,
          label: w.label,
          startDate: new Date(w.startDate),
          endDate: new Date(w.endDate),
        },
      });
      for (const [subjectCode, topicText] of Object.entries(w.cells)) {
        const subjectId = subjectMap.get(subjectCode);
        if (!subjectId) {
          console.warn(`[seed] Eksik ders kodu: ${subjectCode}`);
          continue;
        }
        await prisma.roadmapCell.create({
          data: { weekId: week.id, subjectId, topicText },
        });
      }
    }
    console.log(
      `[seed] Sistem yol haritasi olusturuldu: ${roadmap.name} (${roadmap.weeks.length} hafta)`
    );
  }
}

async function seedLocalDemo() {
  if (process.env.SEED_DEMO !== "1") return;
  const email = process.env.SEED_DEMO_EMAIL ?? "hoca@netkoc.local";
  const password = process.env.SEED_DEMO_PASSWORD ?? "netkoc-hoca-demo";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] Demo hoca duruyor: ${email}`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const tutor = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: "Demo Hoca",
      role: "TUTOR",
      status: "ACTIVE",
    },
  });
  const org = await prisma.organization.create({
    data: { name: "Demo Koçluk", ownerUserId: tutor.id, weekStartsOn: 1 },
  });
  await prisma.user.update({ where: { id: tutor.id }, data: { orgId: org.id } });
  await prisma.student.create({
    data: {
      orgId: org.id,
      fullName: "İrem Çağıl",
      track: "SAYISAL",
      grade: 11,
      graduationYear: 2028,
    },
  });
  console.log(`[seed] Demo hoca + 11. sınıf öğrenci: ${email}`);
}

async function main() {
  console.log("[seed] Basliyor...");
  await seedAdmin();
  await seedSubjects();
  await seedRoadmaps();
  await seedLocalDemo();
  console.log("[seed] Tamamlandi.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
