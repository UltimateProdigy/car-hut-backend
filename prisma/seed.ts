import {
  BodyType,
  CarStatus,
  FuelType,
  PrismaClient,
  Transmission,
} from "@prisma/client";

const prisma = new PrismaClient();

// Helper functions
const generateVIN = () => {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  let vin = "";
  for (let i = 0; i < 17; i++) {
    vin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return vin;
};

const generateLicensePlate = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let plate = "";

  for (let i = 0; i < 3; i++) {
    plate += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  plate += "-";
  for (let i = 0; i < 3; i++) {
    plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return plate;
};

// New helper function for auction data
const getRandomAuctionData = (price: number) => {
  const hasAuction = Math.random() > 0.5; // 50% chance of auction
  
  if (!hasAuction) {
    return {
      auction_start_date: null,
      auction_end_date: null,
      reserve_price: null,
      current_bid: null,
      buy_now_price: Math.floor(price * (1.1 + Math.random() * 0.1)), // 10-20% markup
    };
  }
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 3);
  
  const reservePrice = Math.random() > 0.5 
    ? Math.floor(price * (0.8 + Math.random() * 0.2)) // 80-100% of price
    : null;
  
  return {
    auction_start_date: startDate,
    auction_end_date: endDate,
    reserve_price: reservePrice,
    current_bid: null, // Always null initially
    buy_now_price: Math.floor(price * (1.1 + Math.random() * 0.2)), // 10-30% markup
  };
};

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await prisma.bid.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.car.deleteMany();
    await prisma.feature.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.user.deleteMany();

    console.log("🗑️ Cleared existing data");

    // Create users
    const users = await Promise.all([
      prisma.user.create({
        data: {
          username: "john_doe",
          email: "john@example.com",
          password: "$2b$10$YourHashedPassword123",
        },
      }),
      prisma.user.create({
        data: {
          username: "jane_smith",
          email: "jane@example.com",
          password: "$2b$10$YourHashedPassword123",
        },
      }),
      prisma.user.create({
        data: {
          username: "mike_wilson",
          email: "mike@example.com",
          password: "$2b$10$YourHashedPassword123",
        },
      }),
      prisma.user.create({
        data: {
          username: "sarah_jones",
          email: "sarah@example.com",
          password: "$2b$10$YourHashedPassword123",
        },
      }),
      prisma.user.create({
        data: {
          username: "admin_user",
          email: "admin@example.com",
          password: "$2b$10$YourHashedPassword123",
          role: "ADMIN",
        },
      }),
    ]);

    console.log(`👥 Created ${users.length} users`);

    // Create staff
    const staff = await prisma.staff.create({
      data: {
        username: "staff_admin",
        email: "staff@example.com",
        password: "$2b$10$YourHashedPassword123",
        role: "ADMIN",
      },
    });

    console.log("👨‍💼 Created staff member");

    // Create features
    const featuresData = [
      // Safety
      { name: "ABS Brakes" },
      { name: "Airbags" },
      { name: "Traction Control" },
      { name: "Stability Control" },
      { name: "Blind Spot Monitoring" },
      { name: "Lane Departure Warning" },
      { name: "Forward Collision Warning" },
      { name: "Automatic Emergency Braking" },
      { name: "Rear Cross Traffic Alert" },
      { name: "Parking Sensors" },
      { name: "360 Camera" },
      { name: "Adaptive Cruise Control" },

      // Comfort
      { name: "Power Windows" },
      { name: "Power Locks" },
      { name: "Keyless Entry" },
      { name: "Push Button Start" },
      { name: "Dual Zone Climate Control" },
      { name: "Heated Seats" },
      { name: "Ventilated Seats" },
      { name: "Heated Steering Wheel" },
      { name: "Sunroof/Moonroof" },
      { name: "Panoramic Roof" },
      { name: "Power Tailgate" },
      { name: "Hands-free Tailgate" },

      // Infotainment
      { name: "Touchscreen Display" },
      { name: "Navigation System" },
      { name: "Apple CarPlay" },
      { name: "Android Auto" },
      { name: "Bluetooth" },
      { name: "USB Ports" },
      { name: "Wireless Charging" },
      { name: "Premium Sound System" },
      { name: "Satellite Radio" },
      { name: "WiFi Hotspot" },
      { name: "Heads-up Display" },

      // Performance
      { name: "All-Wheel Drive" },
      { name: "Four-Wheel Drive" },
      { name: "Turbocharged Engine" },
      { name: "Sport Mode" },
      { name: "Paddle Shifters" },
      { name: "Towing Package" },

      // Exterior
      { name: "LED Headlights" },
      { name: "Fog Lights" },
      { name: "Power Folding Mirrors" },
      { name: "Alloy Wheels" },

      // Interior
      { name: "Leather Seats" },
      { name: "Memory Seats" },
      { name: "Power Adjustable Seats" },
      { name: "Ambient Lighting" },
    ];

    const features = await Promise.all(
      featuresData.map((feature) => prisma.feature.create({ data: feature }))
    );

    console.log(`🔧 Created ${features.length} features`);

    // Create brands
    const brandsData = [
      {
        name: "Toyota",
        logo: "https://cdn.worldvectorlogo.com/logos/toyota-1.svg",
      },
      {
        name: "Honda",
        logo: "https://cdn.worldvectorlogo.com/logos/honda-4.svg",
      },
      {
        name: "Ford",
        logo: "https://cdn.worldvectorlogo.com/logos/ford-8.svg",
      },
      { name: "BMW", logo: "https://cdn.worldvectorlogo.com/logos/bmw-4.svg" },
      {
        name: "Mercedes-Benz",
        logo: "https://cdn.worldvectorlogo.com/logos/mercedes-benz-9.svg",
      },
      {
        name: "Audi",
        logo: "https://cdn.worldvectorlogo.com/logos/audi-9.svg",
      },
      {
        name: "Tesla",
        logo: "https://cdn.worldvectorlogo.com/logos/tesla-9.svg",
      },
      {
        name: "Porsche",
        logo: "https://cdn.worldvectorlogo.com/logos/porsche-1.svg",
      },
      {
        name: "Chevrolet",
        logo: "https://cdn.worldvectorlogo.com/logos/chevrolet-1.svg",
      },
      {
        name: "Nissan",
        logo: "https://cdn.worldvectorlogo.com/logos/nissan-1.svg",
      },
      {
        name: "Hyundai",
        logo: "https://cdn.worldvectorlogo.com/logos/hyundai-1.svg",
      },
      {
        name: "Kia",
        logo: "https://cdn.worldvectorlogo.com/logos/kia-motors-1.svg",
      },
      {
        name: "Volkswagen",
        logo: "https://cdn.worldvectorlogo.com/logos/volkswagen-1.svg",
      },
      {
        name: "Subaru",
        logo: "https://cdn.worldvectorlogo.com/logos/subaru-1.svg",
      },
      {
        name: "Lexus",
        logo: "https://cdn.worldvectorlogo.com/logos/lexus-6.svg",
      },
    ];

    const brands = await Promise.all(
      brandsData.map((brand) => prisma.brand.create({ data: brand }))
    );

    console.log(`🏷️ Created ${brands.length} brands`);

    // Create categories
    const categoriesData = [
      { name: "Sedan" },
      { name: "SUV" },
      { name: "Truck" },
      { name: "Coupe" },
      { name: "Sports Car" },
      { name: "Luxury" },
      { name: "Electric Vehicle" },
      { name: "Hybrid" },
      { name: "Hatchback" },
      { name: "Minivan" },
      { name: "Van" },
      { name: "Convertible" },
    ];

    const categories = await Promise.all(
      categoriesData.map((category) =>
        prisma.category.create({ data: category })
      )
    );

    console.log(`📁 Created ${categories.length} categories`);

    // Helper function to get random features
    const getRandomFeatures = (count: number | undefined) => {
      const shuffled = [...features].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map((f) => ({ id: f.id }));
    };

    // Helper function to get random images for car
    const getRandomCarImages = () => {
      const carImages = [
        "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1555212697-194d092e3b8f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800",
      ];

      const shuffled = [...carImages].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3); // Return 3 random images
    };

    // Cars data - 20 cars (simplified without auction fields)
    const carsData = [
      {
        name: "Toyota Camry XLE",
        description:
          "Well-maintained family sedan with all service records. Single owner, non-smoker vehicle.",
        model: "Camry",
        year: 2022,
        price: 24999,
        mileage: 18500,
        location: "Los Angeles, CA",
        fuel_type: FuelType.HYBRID,
        transmission: Transmission.AUTOMATIC,
        engine_size: "2.5L",
        horsepower: 208,
        color: "White",
        body_type: BodyType.SEDAN,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 8,
        brandName: "Toyota",
        categoryName: "Sedan",
        userId: users[0].id,
      },
      {
        name: "Ford F-150 Lariat",
        description:
          "Powerful pickup truck with towing package. Perfect for work or adventure.",
        model: "F-150",
        year: 2021,
        price: 42999,
        mileage: 32000,
        location: "Dallas, TX",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "3.5L V6 EcoBoost",
        horsepower: 400,
        color: "Black",
        body_type: BodyType.TRUCK,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 10,
        brandName: "Ford",
        categoryName: "Truck",
        userId: users[1].id,
      },
      {
        name: "Tesla Model 3 Performance",
        description:
          "Electric vehicle with autopilot. Fast acceleration and low maintenance.",
        model: "Model 3",
        year: 2023,
        price: 51999,
        mileage: 8500,
        location: "San Francisco, CA",
        fuel_type: FuelType.ELECTRIC,
        transmission: Transmission.AUTOMATIC,
        engine_size: "Dual Motor",
        horsepower: 450,
        color: "Red",
        body_type: BodyType.SEDAN,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 12,
        brandName: "Tesla",
        categoryName: "Electric Vehicle",
        userId: users[2].id,
      },
      {
        name: "BMW 3 Series",
        description:
          "Luxury sedan with premium features. Excellent handling and performance.",
        model: "330i",
        year: 2022,
        price: 44999,
        mileage: 12000,
        location: "Miami, FL",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "2.0L Turbo",
        horsepower: 255,
        color: "Blue",
        body_type: BodyType.SEDAN,
        is_featured: false,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 15,
        brandName: "BMW",
        categoryName: "Luxury",
        userId: users[3].id,
      },
      {
        name: "Honda CR-V EX",
        description:
          "Reliable SUV with great fuel economy. Perfect for family trips.",
        model: "CR-V",
        year: 2021,
        price: 28999,
        mileage: 25000,
        location: "Seattle, WA",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "1.5L Turbo",
        horsepower: 190,
        color: "Gray",
        body_type: BodyType.SUV,
        is_featured: false,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 8,
        brandName: "Honda",
        categoryName: "SUV",
        userId: users[0].id,
      },
      {
        name: "Porsche 911 Carrera",
        description:
          "Iconic sports car with excellent performance. Well-maintained by single owner.",
        model: "911",
        year: 2020,
        price: 112999,
        mileage: 8000,
        location: "Las Vegas, NV",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "3.0L Twin-Turbo",
        horsepower: 379,
        color: "Silver",
        body_type: BodyType.COUPE,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 20,
        brandName: "Porsche",
        categoryName: "Sports Car",
        userId: users[1].id,
      },
      {
        name: "Chevrolet Silverado",
        description: "Powerful work truck with crew cab. Ready for any job.",
        model: "Silverado 1500",
        year: 2022,
        price: 45999,
        mileage: 18000,
        location: "Denver, CO",
        fuel_type: FuelType.DIESEL,
        transmission: Transmission.AUTOMATIC,
        engine_size: "3.0L Turbo Diesel",
        horsepower: 277,
        color: "White",
        body_type: BodyType.TRUCK,
        is_featured: false,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 10,
        brandName: "Chevrolet",
        categoryName: "Truck",
        userId: users[2].id,
      },
      {
        name: "Audi Q5 Premium",
        description: "Luxury compact SUV with quattro all-wheel drive.",
        model: "Q5",
        year: 2021,
        price: 41999,
        mileage: 22000,
        location: "Chicago, IL",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "2.0L Turbo",
        horsepower: 261,
        color: "Black",
        body_type: BodyType.SUV,
        is_featured: false,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 14,
        brandName: "Audi",
        categoryName: "SUV",
        userId: users[3].id,
      },
      {
        name: "Mercedes-Benz C-Class",
        description: "Elegant luxury sedan with premium interior.",
        model: "C300",
        year: 2022,
        price: 48999,
        mileage: 15000,
        location: "New York, NY",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "2.0L Turbo",
        horsepower: 255,
        color: "Black",
        body_type: BodyType.SEDAN,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 16,
        brandName: "Mercedes-Benz",
        categoryName: "Luxury",
        userId: users[0].id,
      },
      {
        name: "Nissan Rogue SV",
        description:
          "Compact SUV with modern safety features and great cargo space.",
        model: "Rogue",
        year: 2021,
        price: 25999,
        mileage: 28000,
        location: "Phoenix, AZ",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "2.5L",
        horsepower: 181,
        color: "Blue",
        body_type: BodyType.SUV,
        is_featured: false,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 8,
        brandName: "Nissan",
        categoryName: "SUV",
        userId: users[1].id,
      },
      {
        name: "Hyundai Sonata Limited",
        description:
          "Midsize sedan with lots of tech features and great warranty.",
        model: "Sonata",
        year: 2022,
        price: 27999,
        mileage: 14000,
        location: "Atlanta, GA",
        fuel_type: FuelType.HYBRID,
        transmission: Transmission.AUTOMATIC,
        engine_size: "2.0L",
        horsepower: 192,
        color: "Silver",
        body_type: BodyType.SEDAN,
        is_featured: false,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 10,
        brandName: "Hyundai",
        categoryName: "Sedan",
        userId: users[2].id,
      },
      {
        name: "Kia Telluride SX",
        description:
          "Award-winning SUV with third-row seating. Premium features throughout.",
        model: "Telluride",
        year: 2023,
        price: 48999,
        mileage: 5000,
        location: "Austin, TX",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "3.8L V6",
        horsepower: 291,
        color: "Gravity Gray",
        body_type: BodyType.SUV,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 15,
        brandName: "Kia",
        categoryName: "SUV",
        userId: users[3].id,
      },
      {
        name: "Subaru Outback Touring",
        description: "All-wheel drive wagon perfect for outdoor adventures.",
        model: "Outback",
        year: 2022,
        price: 36999,
        mileage: 16000,
        location: "Portland, OR",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "2.4L Turbo",
        horsepower: 260,
        color: "Green",
        body_type: BodyType.WAGON,
        is_featured: false,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 12,
        brandName: "Subaru",
        categoryName: "SUV",
        userId: users[0].id,
      },
      {
        name: "Lexus RX 350 Luxury",
        description:
          "Reliable luxury SUV with smooth ride and premium features.",
        model: "RX 350",
        year: 2021,
        price: 51999,
        mileage: 19000,
        location: "San Diego, CA",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "3.5L V6",
        horsepower: 295,
        color: "White",
        body_type: BodyType.SUV,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 18,
        brandName: "Lexus",
        categoryName: "Luxury",
        userId: users[1].id,
      },
      {
        name: "Volkswagen Golf GTI",
        description: "Hot hatch with great performance and practicality.",
        model: "GTI",
        year: 2022,
        price: 32999,
        mileage: 9000,
        location: "Boston, MA",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.MANUAL,
        engine_size: "2.0L Turbo",
        horsepower: 241,
        color: "Red",
        body_type: BodyType.HATCHBACK,
        is_featured: false,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 10,
        brandName: "Volkswagen",
        categoryName: "Hatchback",
        userId: users[2].id,
      },
      {
        name: "Toyota RAV4 Hybrid",
        description: "Fuel-efficient hybrid SUV with all-wheel drive.",
        model: "RAV4",
        year: 2023,
        price: 34999,
        mileage: 3000,
        location: "Charlotte, NC",
        fuel_type: FuelType.HYBRID,
        transmission: Transmission.AUTOMATIC,
        engine_size: "2.5L",
        horsepower: 219,
        color: "Blue",
        body_type: BodyType.SUV,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 11,
        brandName: "Toyota",
        categoryName: "Hybrid",
        userId: users[3].id,
      },
      {
        name: "Ford Mustang GT",
        description: "American muscle car with V8 engine and iconic design.",
        model: "Mustang",
        year: 2022,
        price: 42999,
        mileage: 7000,
        location: "Detroit, MI",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.MANUAL,
        engine_size: "5.0L V8",
        horsepower: 450,
        color: "Yellow",
        body_type: BodyType.COUPE,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 12,
        brandName: "Ford",
        categoryName: "Sports Car",
        userId: users[0].id,
      },
      {
        name: "Honda Civic Si",
        description: "Sporty compact car with great handling and fuel economy.",
        model: "Civic",
        year: 2023,
        price: 28999,
        mileage: 4000,
        location: "Orlando, FL",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.MANUAL,
        engine_size: "1.5L Turbo",
        horsepower: 200,
        color: "Black",
        body_type: BodyType.SEDAN,
        is_featured: false,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 9,
        brandName: "Honda",
        categoryName: "Sedan",
        userId: users[1].id,
      },
      {
        name: "Tesla Model Y",
        description:
          "Electric crossover with spacious interior and fast charging.",
        model: "Model Y",
        year: 2023,
        price: 54999,
        mileage: 6000,
        location: "Salt Lake City, UT",
        fuel_type: FuelType.ELECTRIC,
        transmission: Transmission.AUTOMATIC,
        engine_size: "Dual Motor",
        horsepower: 384,
        color: "White",
        body_type: BodyType.SUV,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 14,
        brandName: "Tesla",
        categoryName: "Electric Vehicle",
        userId: users[2].id,
      },
      {
        name: "BMW X5",
        description: "Luxury SUV with powerful engine and premium interior.",
        model: "X5 xDrive40i",
        year: 2022,
        price: 67999,
        mileage: 11000,
        location: "Philadelphia, PA",
        fuel_type: FuelType.GASOLINE,
        transmission: Transmission.AUTOMATIC,
        engine_size: "3.0L Twin-Turbo",
        horsepower: 335,
        color: "Black Sapphire",
        body_type: BodyType.SUV,
        is_featured: true,
        is_active: true,
        images: getRandomCarImages(),
        vin: generateVIN(),
        licensePlate: generateLicensePlate(),
        featuresCount: 20,
        brandName: "BMW",
        categoryName: "Luxury",
        userId: users[3].id,
      },
    ];

    // Create cars
    const createdCars = [];
    for (const carData of carsData) {
      const brand = brands.find((b) => b.name === carData.brandName);
      const category = categories.find((c) => c.name === carData.categoryName);

      // Generate auction data based on car price
      const auctionData = getRandomAuctionData(carData.price);

      const car = await prisma.car.create({
        data: {
          name: carData.name,
          description: carData.description,
          model: carData.model,
          year: carData.year,
          price: carData.price,
          mileage: carData.mileage,
          location: carData.location,
          fuel_type: carData.fuel_type,
          transmission: carData.transmission,
          engine_size: carData.engine_size,
          horsepower: carData.horsepower,
          color: carData.color,
          body_type: carData.body_type,
          is_active: carData.is_active,
          is_featured: carData.is_featured,
          status: CarStatus.AVAILABLE,
          auction_start_date: auctionData.auction_start_date,
          auction_end_date: auctionData.auction_end_date,
          reserve_price: auctionData.reserve_price,
          current_bid: auctionData.current_bid,
          buy_now_price: auctionData.buy_now_price,
          images: carData.images,
          vin: carData.vin,
          licensePlate: carData.licensePlate,
          brand: { connect: { id: brand?.id } },
          category: category ? { connect: { id: category.id } } : undefined,
          user: { connect: { id: carData.userId } },
          features: {
            connect: getRandomFeatures(carData.featuresCount),
          },
        },
      });

      createdCars.push(car);
      console.log(`🚗 Created: ${car.name}`);
      console.log(`   Auction: ${auctionData.auction_start_date ? 'Yes' : 'No'}`);
      if (auctionData.auction_start_date) {
        console.log(`   Start: ${auctionData.auction_start_date.toISOString()}`);
        console.log(`   End: ${auctionData.auction_end_date?.toISOString()}`);
        console.log(`   Reserve: ${auctionData.reserve_price}`);
        console.log(`   Buy Now: ${auctionData.buy_now_price}`);
      }
    }

    console.log(`🚀 Successfully seeded ${createdCars.length} cars`);

    // Create some favorites
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const car = createdCars[Math.floor(Math.random() * createdCars.length)];

      await prisma.favorite
        .create({
          data: {
            user: { connect: { id: user.id } },
            car: { connect: { id: car.id } },
          },
        })
        .catch(() => {
          // Ignore duplicate favorite errors
        });
    }

    console.log("❤️ Created some favorites");

    // Create some bids for auction cars
    const auctionCars = createdCars.filter(c => c.auction_start_date !== null);
    for (let i = 0; i < Math.min(15, auctionCars.length * 3); i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const car = auctionCars[Math.floor(Math.random() * auctionCars.length)];
      
      if (car) {
        await prisma.bid.create({
          data: {
            amount: car.price * (0.8 + Math.random() * 0.4), // 80-120% of car price
            car: { connect: { id: car.id } },
            user: { connect: { id: user.id } },
          },
        });
      }
    }

    console.log("💰 Created some bids for auction cars");

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed();