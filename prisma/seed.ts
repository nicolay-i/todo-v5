import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.pinnedListItem.deleteMany()
  await prisma.task.deleteMany()
  await prisma.pinnedList.deleteMany()

  const primary = await prisma.pinnedList.create({
    data: {
      title: 'Главное',
      position: 0,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Проверка перед релизом',
      order: 0,
      children: {
        create: [
          { title: 'Прогнать авто-тесты', completed: true, order: 0 },
          { title: 'Проверить ручные сценарии', order: 1 },
          { title: 'Согласовать список изменений', order: 2 },
        ],
      },
    },
  })

  await prisma.task.create({
    data: {
      title: 'Прототип интерфейса',
      order: 1,
      children: {
        create: [
          { title: 'Скетч основных экранов', order: 0 },
          {
            title: 'Собрать обратную связь',
            order: 1,
            children: {
              create: [{ title: 'Созвон с командой продукта', order: 0 }],
            },
          },
        ],
      },
    },
  })

  await ensurePinnedLists(prisma, primary.id)
}

async function ensurePinnedLists(client: PrismaClient, primaryId: string) {
  const count = await client.pinnedList.count()
  if (count === 0) {
    await client.pinnedList.create({ data: { title: 'Главное', position: 0 } })
  } else {
    await client.pinnedList.update({ where: { id: primaryId }, data: { title: 'Главное', position: 0 } })
  }
}

main()
  .catch((error) => {
    console.error('Seed failed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
