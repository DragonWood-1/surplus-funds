import { PrismaClient, CaseStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const states = ['GA', 'TX', 'FL', 'CA', 'AZ', 'NC', 'OH', 'PA', 'IL', 'NY']
const counties: Record<string, string[]> = {
  GA: ['Fulton', 'DeKalb', 'Cobb', 'Gwinnett', 'Clayton'],
  TX: ['Harris', 'Dallas', 'Bexar', 'Travis', 'Tarrant'],
  FL: ['Miami-Dade', 'Broward', 'Palm Beach', 'Hillsborough', 'Orange'],
  CA: ['Los Angeles', 'San Diego', 'Orange', 'Riverside', 'Sacramento'],
  AZ: ['Maricopa', 'Pima', 'Pinal', 'Yavapai', 'Mohave'],
  NC: ['Mecklenburg', 'Wake', 'Guilford', 'Forsyth', 'Durham'],
  OH: ['Franklin', 'Cuyahoga', 'Hamilton', 'Summit', 'Montgomery'],
  PA: ['Philadelphia', 'Allegheny', 'Montgomery', 'Bucks', 'Chester'],
  IL: ['Cook', 'DuPage', 'Lake', 'Will', 'Winnebago'],
  NY: ['Kings', 'Queens', 'New York', 'Suffolk', 'Nassau'],
}

const firstNames = ['John', 'Maria', 'David', 'Sarah', 'Michael', 'Lisa', 'Robert', 'Jennifer', 'William', 'Patricia', 'James', 'Linda', 'Charles', 'Barbara', 'Thomas', 'Elizabeth', 'Daniel', 'Susan', 'Paul', 'Jessica']
const lastNames = ['Smith', 'Lopez', 'Green', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@surplusflow.com' },
    update: {},
    create: {
      email: 'admin@surplusflow.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create demo professional user
  const demoPassword = await bcrypt.hash('demo123', 10)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@surplusflow.com' },
    update: {},
    create: {
      email: 'demo@surplusflow.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'PROFESSIONAL',
    },
  })

  // Seed counties
  for (const [stateCode, countyList] of Object.entries(counties)) {
    for (const countyName of countyList) {
      await prisma.county.upsert({
        where: { name_stateCode: { name: countyName, stateCode } },
        update: {},
        create: {
          name: countyName,
          state: stateCode === 'GA' ? 'Georgia' : stateCode,
          stateCode,
          taxCommissionerUrl: `https://www.${countyName.toLowerCase().replace(/[^a-z]/g, '')}county${stateCode.toLowerCase()}.gov`,
          totalCases: Math.floor(Math.random() * 200) + 10,
          totalSurplus: randomFloat(100000, 5000000),
        },
      })
    }
  }

  // Seed surplus cases
  const statuses = ['NEW', 'ACTIVE', 'CONTACTED', 'VERIFIED', 'RECOVERED', 'CLOSED'] as CaseStatus[]
  const startDate = new Date('2023-01-01')
  const endDate = new Date()

  for (let i = 0; i < 150; i++) {
    const state = randomItem(states)
    const county = randomItem(counties[state])
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const saleDate = randomDate(startDate, endDate)
    const debtAmount = randomFloat(50000, 400000)
    const salePrice = debtAmount + randomFloat(10000, 150000)
    const surplusAmount = salePrice - debtAmount
    const claimDeadline = new Date(saleDate)
    claimDeadline.setFullYear(claimDeadline.getFullYear() + 1)
    const score = Math.min(100, (surplusAmount / 10000) * 0.5 + Math.random() * 50)

    const surplusCase = await prisma.surplusCase.create({
      data: {
        ownerName: `${firstName} ${lastName}`,
        propertyAddress: `${Math.floor(Math.random() * 9000) + 1000} ${randomItem(['Oak', 'Maple', 'Pine', 'Elm', 'Cedar', 'Main', 'Park', 'Lake', 'Hill', 'River'])} ${randomItem(['Ave', 'St', 'Blvd', 'Dr', 'Rd', 'Ln', 'Ct'])}`,
        city: randomItem(['Atlanta', 'Houston', 'Miami', 'Los Angeles', 'Phoenix', 'Charlotte', 'Columbus', 'Philadelphia', 'Chicago', 'New York']),
        state,
        county,
        apn: `${Math.floor(Math.random() * 99)}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}-${randomItem(['AA', 'BB', 'CC', 'LL', 'MM'])}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
        saleDate,
        salePrice,
        debtAmount,
        surplusAmount,
        courtCase: `${state}-${new Date().getFullYear()}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
        claimDeadline,
        status: randomItem(statuses),
        score,
        priority: score > 70 ? 'HIGH' : score > 40 ? 'MEDIUM' : 'LOW',
        ownerContacts: {
          create: {
            phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
            knownAddress: `${Math.floor(Math.random() * 9000) + 1000} Main St, ${randomItem(['Atlanta', 'Houston', 'Miami'])} ${state} ${Math.floor(Math.random() * 90000) + 10000}`,
            aliases: [`${firstName[0]} ${lastName}`, `${firstName} ${lastName[0]}.`],
            confidence: Math.random() * 0.4 + 0.6,
            isVerified: Math.random() > 0.5,
          },
        },
      },
    })

    // Add to CRM for demo user (first 30 cases)
    if (i < 30) {
      await prisma.crmLead.create({
        data: {
          userId: demoUser.id,
          caseId: surplusCase.id,
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
          phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          status: randomItem(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']),
          score: Math.random() * 100,
          source: randomItem(['WEBSITE', 'REFERRAL', 'SEO', 'PAID_ADS']),
        },
      })
    }
  }

  // Add marketplace items
  const cases = await prisma.surplusCase.findMany({ take: 20, orderBy: { surplusAmount: 'desc' } })
  for (const c of cases) {
    const tier = c.surplusAmount > 50000 ? 'PREMIUM' : c.surplusAmount > 20000 ? 'VERIFIED' : 'BASIC'
    const price = tier === 'PREMIUM' ? 400 : tier === 'VERIFIED' ? 150 : 25
    await prisma.leadMarketplaceItem.upsert({
      where: { caseId: c.id },
      update: {},
      create: {
        caseId: c.id,
        price,
        tier,
        isAvailable: true,
      },
    })
  }

  // Revenue events
  for (let i = 0; i < 50; i++) {
    await prisma.revenueEvent.create({
      data: {
        type: randomItem(['SAAS', 'LEAD_SALE', 'RECOVERY_COMMISSION']),
        amount: randomFloat(25, 20000),
        description: 'Revenue event',
        createdAt: randomDate(new Date('2024-01-01'), new Date()),
      },
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
