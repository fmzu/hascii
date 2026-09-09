import { ThemeProvider } from "next-themes"

type Props = {
  children: React.ReactNode
}

export const RootProviders = (props: Props) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {props.children}
    </ThemeProvider>
  )
}
