export default {
  name: 'exerciseEntry',
  type: 'object',
  title: 'Exercise Entry',
  fields: [
    {
      name: 'exercise',
      type: 'reference',
      to: [{type: 'exercise'}],
      title: 'Exercise',
    },
    {
      name: 'sets',
      type: 'array',
      of: [{type: 'set'}],
      title: 'Sets',
    },
  ],
}
