import type { Meta, StoryObj } from '@storybook/vue3'
import Badge from './Badge.vue'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['gray', 'green', 'blue', 'orange', 'red', 'emerald', 'purple'],
    },
    dot: { control: 'boolean' },
  },
  args: {
    default: 'Badge',
  },
  render: (args) => ({
    components: { Badge },
    setup() { return { args } },
    template: '<Badge v-bind="args">{{ args.default }}</Badge>',
  }),
}

export default meta
type Story = StoryObj<typeof Badge>

export const Gray: Story = {
  args: { color: 'gray', default: 'Draft' },
}

export const Green: Story = {
  args: { color: 'green', default: 'Paid' },
}

export const Blue: Story = {
  args: { color: 'blue', default: 'Sent' },
}

export const Orange: Story = {
  args: { color: 'orange', default: 'Pending' },
}

export const Red: Story = {
  args: { color: 'red', default: 'Overdue' },
}

export const Purple: Story = {
  args: { color: 'purple', default: 'Recurring' },
}

export const WithDot: Story = {
  args: { color: 'green', dot: true, default: 'Active' },
}

export const WithoutDot: Story = {
  args: { color: 'green', dot: false, default: 'Active' },
}

export const AllColors: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <Badge color="gray">Gray</Badge>
        <Badge color="green">Green</Badge>
        <Badge color="blue">Blue</Badge>
        <Badge color="orange">Orange</Badge>
        <Badge color="red">Red</Badge>
        <Badge color="emerald">Emerald</Badge>
        <Badge color="purple">Purple</Badge>
      </div>
    `,
  }),
}

export const AllColorsWithDot: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <Badge color="gray" dot>Draft</Badge>
        <Badge color="green" dot>Paid</Badge>
        <Badge color="blue" dot>Sent</Badge>
        <Badge color="orange" dot>Pending</Badge>
        <Badge color="red" dot>Overdue</Badge>
        <Badge color="purple" dot>Recurring</Badge>
      </div>
    `,
  }),
}
