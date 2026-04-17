import type { Meta, StoryObj } from '@storybook/vue3'
import EmptyState from './EmptyState.vue'

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    title: 'No invoices yet',
  },
}

export const WithDescription: Story = {
  args: {
    title: 'No invoices yet',
    description: 'Create your first invoice to get started with billing your clients.',
  },
}

export const CustomIcon: Story = {
  args: {
    icon: '📄',
    title: 'No documents found',
    description: 'Upload or create documents to see them listed here.',
  },
}

export const NoClients: Story = {
  args: {
    icon: '👥',
    title: 'No clients added',
    description: 'Add your first client to start creating invoices and tracking payments.',
  },
}

export const NoTransactions: Story = {
  args: {
    icon: '💰',
    title: 'No transactions recorded',
    description: 'Your transaction history will appear here once you start recording income and expenses.',
  },
}

export const WithAction: Story = {
  args: {
    icon: '📋',
    title: 'No invoices yet',
    description: 'Create your first invoice to get started.',
  },
  render: (args) => ({
    components: { EmptyState },
    setup() { return { args } },
    template: `
      <EmptyState v-bind="args">
        <template #action>
          <button
            style="
              padding: 8px 20px;
              background: #6366f1;
              color: white;
              border: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
            "
          >
            + Create Invoice
          </button>
        </template>
      </EmptyState>
    `,
  }),
}
