import dotenv from 'dotenv';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { query } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const faqs = [
  {
    category: "General",
    question: "What is Slush?",
    answer: "Slush is a not-for-profit organization on a mission to help and create founders to change the world. Based in Helsinki, Slush annually hosts the world's leading startup event, bringing together a curated crowd of European startups, world-class investors, and tech journalists. We stand by relevance over scale, bringing tangible value, and sharing actionable company-building advice. In practice, this means that our 2025 event will host: 6,000+ Startups, 3,500+ Investors, 1,700+ Partners and Ecosystem builders. In addition to our event, we serve founders and investors with a year-round online community and matchmaking platform, Slush Online, and support nascent startup ecosystems globally to build their own local events through Slush'D. Slush is owned by the Startup Foundation, a Finnish not-for-profit working towards strengthening the Finnish startup ecosystem. Most of any profits made by Slush go back to the foundation which uses it to support other ecosystem initiatives. Slush is run by a group of students and recent graduates, and our main event is made possible every year with the help of 1,700 volunteers."
  },
  {
    category: "General",
    question: "When is Slush 2025 organized?",
    answer: "Slush 2025 will take place on Nov 19–20 (Wed–Thu), 2025. Nov 18 is our official Day 0, featuring Investor Day and Founders Day, tailored for ticket holders in those categories."
  },
  {
    category: "General",
    question: "Where does Slush take place?",
    answer: "Slush is organized at the Helsinki Expo and Convention Center, Messukeskus. It's located just a few kilometers from the Helsinki city center, so you'll be able to arrive at the venue within 15 minutes from almost anywhere in the city. Address: Messuaukio 1, 00520 Helsinki"
  },
  {
    category: "General",
    question: "Does Slush provide ticket discounts?",
    answer: "We do not provide discounts outside our early ticket sales campaigns. If you're a student, the best way to attend Slush 2025 is by joining as a volunteer. Check out our Slush for Volunteers page for more info. If you're planning to attend with a larger delegation or are interested in partner activities, such as a booth at the event, drop us a line at partners@slush.org."
  },
  {
    category: "General",
    question: "What are Slush Side Events?",
    answer: "Originally a two-day happening, Slush has grown into an entire week of events around the Helsinki metropolitan area. In addition to the official Activities organized by Slush, there are hundreds of Side Events around Helsinki and at the official Partner Side Event Wing in the Slush venue. You'll be able to browse and apply for the Slush 2025 Side Events during the fall."
  },
  {
    category: "General",
    question: "How do I contact the Slush team?",
    answer: "You can reach the team by email: General inquiries hello@slush.org, Tickets tickets@slush.org, Startups startups@slush.org, Investors investors@slush.org, Partners partners@slush.org, Media media@slush.org, Speakers speakers@slush.org, Marketing marketing@slush.org"
  },
  {
    category: "General",
    question: "Is Slush accessible?",
    answer: "Slush ensures that everyone can fully participate in and feel comfortable at the event, regardless of their accessibility needs. Messukeskus has two main entrances equipped with automatic doors for wheelchair access. All floors are accessible by lift. Each floor has easy-access toilets. We have dedicated wheelchair spots at each stage and wheelchair-accessible ramps for speakers. We have 20 marked parking spaces for people with disabilities at the P1 level near the Northern Entrance. Attendees requiring assistance or an interpreter are welcome to bring them free of charge. Guide and assistance dogs are also welcome. We have a Quiet Room (Messukeskus Siipi Room 213) open from 8 AM–10 PM during the main event. Sensory toolkits (earplugs, sunglasses, communication cards) are available at Info Points. We have Harassment Contact Persons (licensed psychologists from Laavu.io) available at all key events."
  },
  {
    category: "General",
    question: "What is Slush doing to reduce the ecological footprint of the Slush Main Event in 2025?",
    answer: "Slush team wants to leave the world in a better place than we found it. The Slush Main Event generates 308 tonnes of CO₂ emissions each year. To take long-term responsibility, we're permanently protecting Finnish forest through the Slush Forest initiative. In 2025, we're beginning by preserving 51 hectares—capturing 133.4 tCO₂e annually, in perpetuity. That's the equivalent of protecting 39 square meters of forest per Slush visitor. Other sustainability efforts include: 35 recycling stations with volunteers (no mixed waste since 2023), reusing decorative elements year after year, working with Jylhä Logistics Oy whose trucks run on renewable liquefied biogas (LBG) reducing greenhouse gas emissions by around 90%, and using CO₂ neutral electricity at the venue."
  },

  {
    category: "Tickets",
    question: "How can I get a ticket to Slush?",
    answer: "Purchase your ticket to Slush through the Slush Platform. If you are buying a Startup, Scaleup, or Investor Pass, we will first ask you to register your company via an application process. Once you submit your application, the Slush Team will review your company profile within 2 working days and grant you access to purchase your ticket, given that you meet the ticket requirements. Ecosystem and Thursday passes are available for all to purchase, but require being part of a company profile on the Slush Platform."
  },
  {
    category: "Tickets",
    question: "What are the different ticket types?",
    answer: "Our available ticket types are Startup, Scaleup, Investor, Ecosystem, and Thursday Passes. Besides, media representatives can apply for a free Media Pass. Startup Pass is for young, tech-driven companies aiming for rapid growth with a scalable business model (max. 7 years old, not exited yet). Scaleup Pass is for mature tech companies over 8 years old, or younger businesses that have raised more than €100M in funding. Investor Pass is for VCs, CVCs, Angels, LPs, and M&A Investors. Ecosystem Pass is for exited scaleups, corporations, ecosystem players, accelerators, policymakers, and general attendees. Media Accreditation is for journalists/editorial members of the press only."
  },
  {
    category: "Tickets",
    question: "How can I pay for my ticket?",
    answer: "Slush uses Stripe Payments Europe Ltd for transaction processing, which accepts credit cards with global payment options (Visa, MasterCard, and American Express). Contact tickets@slush.org if you've got any questions about the payment methods."
  },
  {
    category: "Tickets",
    question: "Where can I find my tickets?",
    answer: "You can see your tickets and assign tickets to other people by logging into the Slush Platform. You must sign in with the same credentials as you did when purchasing your ticket. If the ticket has been assigned to you by someone else, you will have received a confirmation email about this. When logging in, use the email address to which you've received the confirmation."
  },
  {
    category: "Tickets",
    question: "Can I buy passes on behalf of my team members/colleagues?",
    answer: "Yes. When buying on behalf of another person, you must assign their tickets through the Slush Platform. We recommend you do this well in advance to allow your colleagues to make the most of the Matchmaking Tool and hear about updates regarding the event."
  },
  {
    category: "Tickets",
    question: "Can I transfer my ticket to another person?",
    answer: "Yes, you can reassign your ticket to another person by logging into the Slush Platform and navigating to Tickets -> Manage tickets. Please note that reassigning your ticket is possible only before the event when the Slush Badge has not yet been printed out."
  },
  {
    category: "Tickets",
    question: "When and where can I collect my Slush badge?",
    answer: "You'll be able to collect your Slush badge at our Badge Claim Points before the event, as well as at the venue during Slush. We'll share more detailed information, including locations and opening hours, closer to the event."
  },
  {
    category: "Tickets",
    question: "Is there a possibility for a refund if I am not able to come?",
    answer: "All tickets for Slush are non-refundable. If you can find someone who can attend the event instead of you, it's possible to transfer the ticket to them, as long as the change is made before the event. You can transfer your ticket to another person by logging into the Slush Platform."
  },
  {
    category: "Tickets",
    question: "Do I need to print my ticket?",
    answer: "No, all Slush Passes are electronic. Thus, you only need a valid ID (i.e. passport) to collect your Slush Badge from one of our Badge Claim Points or at the Slush Venue during the event days. You need to wear your Slush 2025 badge and wristband at all times during the event and afterparty."
  },
  {
    category: "Tickets",
    question: "Does Slush provide ticket discounts?",
    answer: "We do not provide discounts outside our ticket campaigns (Hatching Bird & Early Bird). We recommend students join as volunteers to get access to Slush. Check out our Slush for Volunteers page for more info. If you're interested in attending Slush with a larger delegation and purchasing partner activities, such as a booth at the event, drop us a line at partners@slush.org."
  },
  {
    category: "Tickets",
    question: "Can you help with my visa application?",
    answer: "Slush can help with visa applications by providing a visa invitation letter. Contact tickets@slush.org for this matter. Read more about Finland's visa policies on the website of the Ministry for Foreign Affairs of Finland."
  },

  {
    category: "Startups",
    question: "Who can apply for a Startup Pass?",
    answer: "Our Startup Pass is tailored for young, tech-driven companies that aim for rapid growth and have a scalable business model, and are founded in 2018 or later. We go through each application manually. Once your application has been accepted, you can buy your Startup Pass. Please remember that each team member needs their own ticket to attend."
  },
  {
    category: "Startups",
    question: "What is Founders Day?",
    answer: "Our Founders Day is an exclusive gathering for founders to kick off your Slush days on the evening of Tue, Nov 18 (Day 0). Focused on connecting founders through peer-to-peer networking, company-building-focused stage program and program hosted by top partners, this is the largest side-event for startups and scaleups during Slush Week. Please note, that Founders Day has limited capacity and requires separate registration on the Slush Platform."
  },
  {
    category: "Startups",
    question: "Can I book meetings with attendees before the event?",
    answer: "Yes, you can, and, in fact, most of the meetings are booked already prior to the event right after we've opened our Meeting Tool. Our tool allows you to: Discover any registered Slush visitor, startup, investor, or speaker based on your search criteria, Book and manage meetings, Have 25-minute meetings with prospective people in the Meeting Area, Chat with people prior to the meetings through the tool. However, the Meeting Tool of Slush does not automatically offer virtual meeting capabilities. Of course, attendees are still free to set up virtual meetings once connected through the Meeting Tool."
  },
  {
    category: "Startups",
    question: "My company would like to announce something at Slush. What should I do?",
    answer: "Submit your news to our Media Team at media@slush.org. Note that your announcement is subject to review by our Media Team and will be added to a platform for journalists only after review."
  },
  {
    category: "Startups",
    question: "What do I have access to with a Thursday Pass?",
    answer: "A Thursday Pass is your gateway to Slush if you missed out on a Startup or Scaleup Pass. With an accepted startup or scaleup company profile you can still attend big side events like Founders Day, our legendary Afterparty, and of course the full Day 2 of Slush. You can still get a 3-day Slush experience by attending great side events on Day 0 and 1, and the main event on Day 2."
  },
  {
    category: "Startups",
    question: "Who can apply for a Scaleup Pass?",
    answer: "Our Scaleup category is targeted towards mature tech companies that have proven product-market fit, a scalable business model and show evidence of continuous, rapid growth throughout several years. This category is also for companies that otherwise would fit the Startup category but are founded before 2018. Once your application has been accepted, you can buy your Scaleup Pass. Please remember that each team member needs their own ticket to attend."
  },

  {
    category: "Investors",
    question: "Who can apply for an Investor Pass?",
    answer: "Our Investor Pass is for investors who make direct investments in startups or venture capital funds—VCs, CVCs, Angels, LPs, and M&A Investors."
  },
  {
    category: "Investors",
    question: "How can I buy an Investor Pass for Slush?",
    answer: "You can purchase your ticket to Slush from the Slush Platform. Every investor must register their investor company profile on the Slush Platform before gaining access to purchase a ticket. This process ensures that investor tickets are reserved for actual investors. The Slush Team processes each application. The estimated wait time is 2 working days. Once your application is approved, you can proceed to purchase your Investor Pass as long as tickets are available. If you have attended Slush before, please log in using the same credentials as last year to speed up your process."
  },
  {
    category: "Investors",
    question: "Do I get a bulk discount when purchasing many investor tickets?",
    answer: "Unfortunately, we are not able to offer any discounts on our tickets. Since we're a not-for-profit, we already keep ticket prices as low as possible while still organizing the best startup event on the planet. Thanks for understanding."
  },
  {
    category: "Investors",
    question: "What investor-focused opportunities are there at Slush?",
    answer: "Our team works hard to provide investors with the most valuable activities and opportunities at Slush to help them connect with the right people and make the most of their visit."
  },
  {
    category: "Investors",
    question: "Where can I find data on companies and people attending Slush?",
    answer: "All investors at Slush will have the possibility to access and export an extensive list of startups at Slush from our Startup Database on the Slush Platform."
  },
  {
    category: "Investors",
    question: "My company would like to announce something at Slush. What should I do?",
    answer: "Submit your news to our Media Bank. Note that your announcement is subject to review by our Media Team. If you're looking for a chance to speak on stage, please reach out to speakers@slush.org."
  },
  {
    category: "Investors",
    question: "What is Investor Day?",
    answer: "Investor Day is an exclusive gathering to kick off your Slush Week on Day 0 (Nov 18). Focused on connecting investors through peer-to-peer roundtables, venture-focused stage program, and free-form networking. Investor Day is the largest side-event for investors during the Slush week that you don't want to miss. Please note that you need to have an assigned ticket on your profile to register successfully."
  },
  {
    category: "Investors",
    question: "When should I arrive in Helsinki?",
    answer: "We recommend you arrive in Helsinki one or two days before the main event to be in town for the official Day 0 (Nov 18) program and various side events hosted by our partners and the wider startup community."
  },
  {
    category: "Investors",
    question: "I'm an LP and a VC—what company type should I register as?",
    answer: "Register as the company type that you most identify with. If you reach out to investors@slush.org, and let us know so we can make sure you're invited to both LP and VC events."
  },

  {
    category: "Media",
    question: "Why should I go to Slush as a media representative?",
    answer: "Every year, journalists, opinion leaders, podcasters, and writers gather in Helsinki for Slush in November to find the best startups and capture their next big story. Three reasons why you won't want to miss out: 1) Discover stories worth telling - Slush is the world's most founder-focused event, with 6000+ startup founders and operators gathering in Helsinki. 2) Trendspotting - Slush is the place for uncovering emerging trends in tech and startups. 3) Everyone's here - Whether you're chasing an interview with a high-profile speaker or scouting for the next breakout founder, Slush is the perfect place to make it happen."
  },
  {
    category: "Media",
    question: "Who can get a Media Pass?",
    answer: "Slush Media Passes are reserved for journalists and editorial members of the press. With limited availability, we prioritize passes for outlets with a strong following and journalists with a solid track record in covering startups, tech, or venture capital. Freelancers, podcasters, bloggers, and other independent creators are also invited to apply, though applications will be closely reviewed for relevance. Please note that PR and communications professionals, as well as non-editorial media staff, are encouraged to purchase an Ecosystem or a Thursday Pass."
  },
  {
    category: "Media",
    question: "How can I find news during Slush?",
    answer: "At Slush, we've made it easy for you to find news for your next piece: Follow our main event's stage program and get to know our fantastic speakers. Make the most of our in-house Slush Matchmaking Tool, designed to help you message the speakers, founders, and investors you have been eager to meet and interview. We're planning a concentrated Slush info package for journalists including everything you need to know about Slush, our speakers, startups and investors so stay tuned!"
  },
  {
    category: "Media",
    question: "Where can I find photos from Slush?",
    answer: "All Slush photos can be found on our website. Publications, articles, and all non-commercial Slush-related usage of our photos and videos are allowed when crediting the photographer or videographer and mentioning that the photo or video is from Slush. You are not allowed to edit the photos or videos or to use them for commercial purposes. If you want to use the photos or videos for commercial use, get in touch with us."
  },
  {
    category: "Media",
    question: "Who are the speakers coming to Slush?",
    answer: "You can discover all the speakers coming to Slush in our Speaker Page. Note that we publish new speakers regularly and that the Slush agenda will launch in the fall."
  },
  {
    category: "Media",
    question: "How can I book interviews with Slush attendees?",
    answer: "The best and most efficient way to book interviews at Slush is through our Matchmaking Tool. You can search for people, startups, investors, and other attendees and filter them based on your interests. You can book the interviews directly on the tool to the Slush Media Area and chat with the participants in advance. You can access the Matchmaking tool on the Slush Platform."
  },
  {
    category: "Media",
    question: "What amenities will be available to the media?",
    answer: "We will have a large Media Area in the main event venue with pre-bookable interview and podcast pods, working tables, shooting locations, and a silent streaming area. You'll have exclusive access to our info package designed for Media needs, which will feature all the information you'll need to create your next piece successfully. Available later this year."
  },
  {
    category: "Media",
    question: "How can I find more insights and data about Slush Attendees?",
    answer: "Slush 2025 will gather 13,000 founders, investors, and media this year on Nov 19–20 in Helsinki. Slush 2025 in numbers: 6000+ startup operators and founders, 3500+ Investors, 250 media representatives, 1700+ Partners and Ecosystem Builders. We're expecting more than 20,000 meetings to take place during Slush."
  }
];

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function seedFAQs() {
  const existingFAQs = await query('SELECT COUNT(*) FROM faqs');
  if (parseInt(existingFAQs.rows[0].count) > 0) {
    return;
  }

  for (const faq of faqs) {
    try {
      const embedding = await generateEmbedding(faq.question);
      
      await query(
        'INSERT INTO faqs (category, question, answer, embedding) VALUES ($1, $2, $3, $4)',
        [faq.category, faq.question, faq.answer, `[${embedding.join(',')}]`]
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to seed FAQ: "${faq.question}"`, error);
      throw error;
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedFAQs()
    .then(() => {
      process.exit(0);
    })
    .catch((_error) => {
      process.exit(1);
    });
}

export { seedFAQs };
