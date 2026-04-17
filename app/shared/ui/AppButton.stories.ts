import type { Meta, StoryObj } from '@storybook/vue3'
import AppButton from './AppButton.vue'

const meta: Meta<typeof AppButton> = {
  title: 'UI/AppButton',
  component: AppButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    default: 'Button',
  },
  render: (args) => ({
    components: { AppButton },
    setup() { return { args } },
    template: '<AppButton v-bind="args">{{ args.default }}</AppButton>',
  }),
}

export default meta
type Story = StoryObj<typeof AppButton>

export const Primary: Story = {
  args: {
    variant: 'primary',
    default: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    default: 'Secondary Button',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    default: 'Outline Button',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    default: 'Ghost Button',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    default: 'Danger Button',
  },
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    default: 'Saving...',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    default: 'Disabled',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    default: 'Small',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
    default: 'Medium',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    default: 'Large',
  },
}

export const AllVariants: Story = {
  render: () => ({
    components: { AppButton },
    template: `
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <AppButton variant="primary">Primary</AppButton>
        <AppButton variant="secondary">Secondary</AppButton>
        <AppButton variant="outline">Outline</AppButton>
        <AppButton variant="ghost">Ghost</AppButton>
        <AppButton variant="danger">Danger</AppButton>
      </div>
    `,
  }),
}

export const AllSizes: Story = {
  render: () => ({
    components: { AppButton },
    template: `
      <div style="display: flex; gap: 12px; align-items: center;">
        <AppButton size="sm">Small</AppButton>
        <AppButton size="md">Medium</AppButton>
        <AppButton size="lg">Large</AppButton>
      </div>
    `,
  }),
}
