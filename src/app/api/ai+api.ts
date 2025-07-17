import OpenAI from "openai"

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  const {exerciseName} = await request.json()

  if (!exerciseName) {
    return Response.json({error: 'Exercise name required'}, {status: 404})
  }

  const prompt = `
You are a fitness coach
you are given an exercise, provide clear instructions on how to perform the exercise. Include if any equipment is required.
Explain the exercise in detail and for a beginner

The exercise name is: ${exerciseName}

Keep it short and concise. Use markdown formatting.

Use the following format:

##Equipment required

##Instructions

###Tips

###Variations

###Safety

keep spacing between the headings and the content.

Always use headings and subheadings
`
  console.log(prompt)

  try {
    const response = await openAI.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user", content: prompt
      }]
    })
    
    return Response.json({message: response.choices[0].message.content})
  } catch (error) {
    console.error("Error fetching AI Guidance:", error)
    return Response.json({error: "An error occurred while fetching the AI Guidance"}, {status: 500})
  }
}

