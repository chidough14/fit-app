export default {
  name: 'set',
  type: 'object',
  title: 'Set',
  fields: [
    {
      name: 'reps',
      type: 'number',
      title: 'Repetitions',
    },
    {
      name: 'weight',
      type: 'number',
      title: 'Weight',
    },
    {
      name: 'weightUnit',
      type: 'string',
      title: 'Weight Unit',
      options: {
        list: [
          {title: 'Kilograms (kg)', value: 'kg'},
          {title: 'Pounds (lbs)', value: 'lbs'},
        ],
        layout: 'radio',
      },
    },
  ],
}
