import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { location, category } = await req.json();
    const city = (location || '').trim();
    const cat = (category || 'any').trim();

    if (!city) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    const apiKey = process.env.Grok_API;

    // If Grok API key is configured, call the actual xAI endpoint
    if (apiKey && apiKey.startsWith('xai-')) {
      try {
        console.log(`[grok API] Contacting xAI API for ${city} / ${cat}`);
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'grok-beta',
            messages: [
              {
                role: 'system',
                content: 'You are an expert local business intelligence and employment assistant for India. Return a JSON array of realistic, prominent local businesses in the specified city, and for each, provide a relevant job opening. Ensure data details reflect actual Indian cities (e.g. realistic Indian business names, distances under 10 km, salaries in INR e.g. ₹15,000/mo to ₹35,000/mo, standard shifts, correct coordinates). Return ONLY a raw JSON array. DO NOT wrap it in markdown code blocks. The JSON objects must match the following structure:\n{\n  "id": "grok-[unique-string]",\n  "title": "[Job Title]",\n  "businessName": "[Name of Business]",\n  "businessRating": [Number 3.8 to 4.9],\n  "distance": "[Number e.g. 1.2] km",\n  "salary": "₹[Number,000]/mo",\n  "jobType": "[Part Time / Full Time / Internship]",\n  "shiftTiming": "[Morning Shift / Evening Shift / Night Shift]",\n  "location": "[Area Name], [City Name]",\n  "description": "[Short job description]",\n  "skillsRequired": ["[Skill 1]", "[Skill 2]", "[Skill 3]"],\n  "vacancies": [Number],\n  "postedDate": "2026-07-12",\n  "contactDetails": { "phone": "[Phone]", "email": "[Email]" },\n  "experienceNeeded": "[e.g. 0-1 years]",\n  "matchPercentage": [Number 70-98],\n  "matchReason": "[A short reason why it matches a typical worker in this field]"\n}'
              },
              {
                role: 'user',
                content: `City: ${city}. Category: ${cat}. Generate 5 prominent jobs.`
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        if (response.ok) {
          const resData = await response.json();
          const jsonContent = resData.choices?.[0]?.message?.content || '';
          
          // Parse JSON content safely (removing any markdown backticks if Grok wraps it anyway)
          const cleanedJson = jsonContent
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

          const parsed = JSON.parse(cleanedJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`[grok API] Successfully fetched ${parsed.length} jobs from xAI.`);
            return NextResponse.json(parsed);
          }
        } else {
          console.error(`[grok API] xAI API error: Status ${response.status}`);
        }
      } catch (grokError) {
        console.error('[grok API] Failed to fetch or parse from xAI:', grokError);
      }
    }

    // --- FALLBACK GENERATOR ---
    // If Grok key is unconfigured or failed, generate customized Indian city jobs
    console.log(`[grok API] Utilizing premium local fallback generator for ${city}`);
    
    // Capitalize city name
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);

    const fallbackJobTitles = [
      { title: 'Restaurant Helper', category: 'Restaurant', type: 'Part Time', shift: 'Morning Shift', salary: '₹16,500/mo', skills: ['Food Safety', 'Prep Work', 'Hygiene'], desc: 'Assist kitchen staff with ingredient prep, dish cleaning, and maintaining dining hygiene standards.' },
      { title: 'Retail Store Assistant', category: 'Boutique', type: 'Part Time', shift: 'Morning Shift', salary: '₹19,000/mo', skills: ['Customer Relations', 'Stock Organization', 'Billing'], desc: 'Manage inventory shelves, help walk-in customers choose products, and assist in checkout counters.' },
      { title: 'Delivery Executive', category: 'Local Business', type: 'Full Time', shift: 'Evening Shift', salary: '₹22,500/mo', skills: ['Two-Wheeler Driving', 'Punctuality', 'Map Navigation'], desc: 'Deliver packages and orders across the city safely. Flexible hours with high weekend bonuses.' },
      { title: 'Clinic Front Desk Executive', category: 'Healthcare', type: 'Full Time', shift: 'Morning Shift', salary: '₹24,000/mo', skills: ['MS Office', 'Reception', 'Customer Support'], desc: 'Greet patients, maintain appointment slots, handle billing queries, and answer phone calls.' },
      { title: 'Junior Graphic Designer', category: 'Professional', type: 'Internship', shift: 'Morning Shift', salary: '₹14,000/mo', skills: ['Figma', 'Photoshop', 'Social Media Design'], desc: 'Create banner ads, social media posts, and pitch decks. Creative portfolio required.' },
      { title: 'Cafeteria Barista', category: 'Restaurant', type: 'Part Time', shift: 'Evening Shift', salary: '₹15,500/mo', skills: ['Coffee Brewing', 'Billing', 'Active Listening'], desc: 'Brew beverages, take orders at billing counter, and ensure clean counter stations.' },
      { title: 'Gym Instructor Assistant', category: 'Gym', type: 'Part Time', shift: 'Evening Shift', salary: '₹17,000/mo', skills: ['Fitness Knowledge', 'Motivation', 'First Aid'], desc: 'Guide gym members with exercise postures, ensure weight racks are organized, and assist head trainers.' },
      { title: 'Data Entry Associate', category: 'Local Business', type: 'Full Time', shift: 'Night Shift', salary: '₹21,000/mo', skills: ['Excel', 'Typing Speed', 'Accuracy'], desc: 'Enter digital records into CRM software. High speed and attention to detail are required.' }
    ];

    const areas: Record<string, string[]> = {
      hyderabad: ['Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur', 'Kondapur'],
      mumbai: ['Bandra West', 'Andheri East', 'Colaba', 'Juhu', 'Worli'],
      bangalore: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar'],
      delhi: ['Connaught Place', 'Saket', 'Karol Bagh', 'Rajouri Garden', 'Vasant Kunj'],
      pune: ['Koregaon Park', 'Kothrud', 'Viman Nagar', 'Hinjewadi', 'Camp'],
      chennai: ['Adyar', 'T. Nagar', 'Nungambakkam', 'Velachery', 'Mylapore'],
      kolkata: ['Salt Lake', 'Park Street', 'New Town', 'Gariahat', 'Howrah']
    };

    const searchKey = formattedCity.toLowerCase();
    const cityAreas = areas[searchKey] || ['Downtown', 'Main Market', 'Central Colony', 'Metro Plaza', 'Green Park'];

    const businesses: Record<string, string[]> = {
      'Restaurant': ['Spice Route', 'Chutneys Grill', 'Biryani Express', 'Cafe Coffee Day', 'Chai Point', 'Royal Kitchen'],
      'Boutique': ['FabIndia', 'Westside', 'Trends Fashion', 'Design Studio', 'Raymond Showroom', 'Saree Emporium'],
      'Healthcare': ['Apollo Clinic', 'Max Health Centre', 'DentCare Clinic', 'Care Diagnostics', 'City Hospital'],
      'Gym': ['Gold Fitness', 'Anytime Fitness', 'Cult.Fit Centre', 'Powerhouse Gym', 'Muscle Studio'],
      'Local Business': ['Quick Delivery Co.', 'Global Outsourcing', 'Direct Marketing Ltd.', 'Express Logistics', 'Smart Services']
    };

    // Generate 5 jobs based on the category filter
    let filteredTitles = fallbackJobTitles;
    if (cat !== 'any') {
      filteredTitles = fallbackJobTitles.filter(j => j.category.toLowerCase().includes(cat.toLowerCase()) || j.title.toLowerCase().includes(cat.toLowerCase()));
      if (filteredTitles.length === 0) {
        filteredTitles = fallbackJobTitles;
      }
    }

    // Shuffle and pick 5
    const shuffled = [...filteredTitles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const generatedJobs = selected.map((j, idx) => {
      const area = cityAreas[idx % cityAreas.length];
      const bizList = businesses[j.category as keyof typeof businesses] || businesses['Local Business'];
      const bizName = bizList[idx % bizList.length];
      const distanceVal = (Math.random() * 4 + 0.5).toFixed(1);
      const ratingVal = (Math.random() * 1.2 + 3.7).toFixed(1);
      const vacancyVal = Math.floor(Math.random() * 5) + 1;
      const matchVal = Math.floor(Math.random() * 25) + 74;

      return {
        id: `grok-fallback-${Date.now()}-${idx}`,
        title: j.title,
        businessName: bizName,
        businessRating: parseFloat(ratingVal),
        distance: `${distanceVal} km`,
        salary: j.salary,
        jobType: j.type,
        shiftTiming: j.shift,
        location: `${area}, ${formattedCity}`,
        description: j.desc,
        skillsRequired: j.skills,
        vacancies: vacancyVal,
        postedDate: new Date().toISOString().split('T')[0],
        contactDetails: {
          phone: `+91 98${Math.floor(Math.random() * 90000000 + 10000000)}`,
          email: `careers@${bizName.toLowerCase().replace(/[^a-z]/g, '') || 'business'}.in`
        },
        experienceNeeded: idx % 3 === 0 ? '0-1 years' : idx % 3 === 1 ? 'No experience required' : '1-2 years',
        matchPercentage: matchVal,
        matchReason: `Matches your city (${formattedCity}) and preferred shift (${j.shift}).`
      };
    });

    return NextResponse.json(generatedJobs);
  } catch (err: any) {
    console.error('[grok API] Fatal route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
