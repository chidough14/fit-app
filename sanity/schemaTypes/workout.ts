import type {Rule} from '@sanity/types'

export default {
  name: 'workout',
  title: 'Workout',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: "Clerk user's ID",
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'duration',
      title: 'Duration (secs)',
      type: 'number',
      validation: (Rule: Rule) => Rule.required().min(0),
    },
    {
      name: 'exercises',
      title: 'Exercises',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'exercise',
              title: 'Exercise',
              type: 'reference',
              to: [{type: 'exercise'}],
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'sets',
              title: 'Sets',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'reps',
                      title: 'Reps',
                      type: 'number',
                      validation: (Rule: Rule) => Rule.required().min(1),
                    },
                    {
                      name: 'weight',
                      title: 'Weight',
                      type: 'number',
                      validation: (Rule: Rule) => Rule.min(0),
                    },
                    {
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'lbs', value: 'lbs'},
                          {title: 'kg', value: 'kg'},
                        ],
                      },
                      validation: (Rule: Rule) => Rule.required(),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// export default {
//   name: 'workout',
//   type: 'document',
//   title: 'Workout',
//   fields: [
//     {
//       name: 'userId',
//       type: 'string',
//       title: 'User ID',
//     },
//     {
//       name: 'date',
//       type: 'datetime',
//       title: 'Workout Date',
//     },
//     {
//       name: 'duration',
//       type: 'number',
//       title: 'Duration (seconds)',
//     },
//     {
//       name: 'exercises',
//       type: 'array',
//       title: 'Exercises',
//       of: [{type: 'exerciseEntry'}],
//     },
//   ],
// }
