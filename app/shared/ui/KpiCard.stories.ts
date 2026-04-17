import type { Meta, StoryObj } from '@storybook/vue3'
import KpiCard from './KpiCard.vue'

const meta: Meta<typeof KpiCard> = {
  title: 'UI/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'green', 'orange', 'red'],
    },
    format: {
      control: 'select',
      options: ['number', 'currency', 'none'],
    },
    loading: { control: 'boolean' },
    label: { control: 'text' },
    value: { control: 'text' },
    icon: { control: 'text' },
    subtitle: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof KpiCard>

export const Basic: Story = {
  args: {
    label: 'Total Invoices',
    value: 42,
    icon: '📄',
    color: 'primary',
  },
}

export const CurrencyFormat: Story = {
  args: {
    label: 'Revenue',
    value: 158750,
    icon: '💰',
    color: 'green',
    format: 'currency',
    subtitle: 'This month',
  },
}

export const Loading: Story = {
  args: {
    label: 'Total Revenue',
    value: 0,
    icon: '💰',
    loading: true,
  },
}

export const WithSubtitle: Story = {
  args: {
    label: 'Outstanding',
    value: 23400,
    icon: '⏳',
    color: 'orange',
    format: 'currency',
    subtitle: '5 invoices pending',
  },
}

export const OverdueAmount: Story = {
  args: {
    label: 'Overdue',
    value: 8500,
    icon: '⚠️',
    color: 'red',
    format: 'currency',
    subtitle: '2 invoices overdue',
  },
}

export const ClientCount: Story = {
  args: {
    label: 'Active Clients',
    value: 18,
    icon: '👥',
    color: 'secondary',
    format: 'number',
  },
}

export const StringValue: Story = {
  args: {
    label: 'Status',
    value: 'Healthy',
    icon: '✅',
    color: 'green',
    format: 'none',
  },
}

export const AllColors: Story = {
  render: () => ({
    components: { KpiCard },
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 900px;">
        <KpiCard label="Primary" :value="1234" icon="◈" color="primary" format="number" />
        <KpiCard label="Secondary" :value="567" icon="◈" color="secondary" format="number" />
        <KpiCard label="Green" :value="89000" icon="💰" color="green" format="currency" />
        <KpiCard label="Orange" :value="4500" icon="⏳" color="orange" format="currency" />
        <KpiCard label="Red" :value="1200" icon="⚠️" color="red" format="currency" />
      </div>
    `,
  }),
}
