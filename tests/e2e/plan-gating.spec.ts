import { test, expect } from '@playwright/test'

function stubUser(permissions: string[]) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    phone: null,
    role: 'admin',
    permissions,
    locale: 'en',
    timezone: 'UTC',
    is_active: true,
    tenant_id: 1,
    client_id: null,
    last_login_at: null,
    created_at: '2026-01-01T00:00:00Z',
    tenant: {
      id: 1,
      name: 'Acme Co',
      slug: 'acme',
      email: null,
      phone: null,
      logo_path: null,
      tagline: null,
      primary_color: null,
      secondary_color: null,
      city: null,
    },
  }
}

function stubSubscription(tier: string, flags: Record<string, boolean> = {}) {
  return {
    data: {
      plan: {
        id: `plan-${tier}`,
        tier,
        name: `${tier} plan`,
        expires_at: null,
        is_trial: false,
      },
      flags,
    },
  }
}

test.describe('plan gating', () => {
  test('starter-tier user hitting /payroll redirects to /subscription?required=payroll', async ({ page, context }) => {
    const permissions = [
      'view_dashboard', 'manage_clients', 'manage_invoices', 'manage_accounts',
      'manage_journal_entries', 'view_reports', 'manage_documents', 'manage_team',
      'manage_timesheets', 'manage_payroll', 'manage_eta', 'manage_subscription',
    ]

    await context.addCookies([{
      name: 'auth_token',
      value: 'stub-token',
      url: 'http://localhost:3000',
    }, {
      name: 'auth_role',
      value: 'admin',
      url: 'http://localhost:3000',
    }, {
      name: 'tenant_id',
      value: '1',
      url: 'http://localhost:3000',
    }])

    await page.route(/\/api\/v1\/me$/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: stubUser(permissions),
          subscription: stubSubscription('starter', { payroll_enabled: false }).data,
        }),
      })
    })

    await page.route(/\/api\/v1\/me\/subscription$/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(stubSubscription('starter', { payroll_enabled: false })),
      })
    })

    await page.addInitScript((user) => {
      localStorage.setItem('auth_user', JSON.stringify(user))
      localStorage.setItem('tenant_id', '1')
    }, stubUser(permissions))

    await page.goto('/payroll', { waitUntil: 'networkidle' })

    await expect(page).toHaveURL(/\/subscription\?required=payroll/)
  })

  test('pro-tier user can reach /payroll when flag is on', async ({ page, context }) => {
    const permissions = ['view_dashboard', 'manage_payroll']

    await context.addCookies([{
      name: 'auth_token',
      value: 'stub-token',
      url: 'http://localhost:3000',
    }, {
      name: 'auth_role',
      value: 'admin',
      url: 'http://localhost:3000',
    }, {
      name: 'tenant_id',
      value: '1',
      url: 'http://localhost:3000',
    }])

    await page.route(/\/api\/v1\/me$/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: stubUser(permissions),
          subscription: stubSubscription('business', { payroll_enabled: true }).data,
        }),
      })
    })

    await page.route(/\/api\/v1\/me\/subscription$/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(stubSubscription('business', { payroll_enabled: true })),
      })
    })

    // Allow any other API calls on the page to return empty data
    await page.route(/\/api\/v1\/payroll.*$/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { current_page: 1, last_page: 1, total: 0, per_page: 15 } }),
      })
    })

    await page.addInitScript((user) => {
      localStorage.setItem('auth_user', JSON.stringify(user))
      localStorage.setItem('tenant_id', '1')
    }, stubUser(permissions))

    await page.goto('/payroll', { waitUntil: 'networkidle' })

    await expect(page).toHaveURL(/\/payroll/)
  })

})
