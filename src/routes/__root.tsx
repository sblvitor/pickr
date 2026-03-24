import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { ThemeProvider } from '@lonik/themer'
import appCss from "../styles.css?url"
import { AppHeader } from "@/components/app-header"
import { FilmGrain } from "@/components/film-grain"
import { BackgroundBlobs } from "@/components/bg-blobs"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Pickr",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          defaultTheme="system" 
          storage="localStorage"
          storageKey="pickr-ui-theme"
        >
          <div className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground transition-colors duration-500">
            <FilmGrain />
            <BackgroundBlobs />
            <AppHeader />
            {children}
          </div>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
