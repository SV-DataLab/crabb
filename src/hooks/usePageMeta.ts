import { useEffect } from 'react'

type UsePageMetaOptions = {
  noIndex?: boolean
}

export function usePageMeta(title: string, description?: string, options?: UsePageMetaOptions) {
  const noIndex = options?.noIndex ?? false

  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    let metaTag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = metaTag?.getAttribute('content') ?? null

    if (description) {
      if (!metaTag) {
        metaTag = document.createElement('meta')
        metaTag.setAttribute('name', 'description')
        document.head.appendChild(metaTag)
      }
      metaTag.setAttribute('content', description)
    }

    let robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previousRobots = robotsTag?.getAttribute('content') ?? null

    if (noIndex) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta')
        robotsTag.setAttribute('name', 'robots')
        document.head.appendChild(robotsTag)
      }
      robotsTag.setAttribute('content', 'noindex, nofollow')
    }

    return () => {
      document.title = previousTitle
      if (description && metaTag) {
        if (previousDescription) {
          metaTag.setAttribute('content', previousDescription)
        } else {
          metaTag.remove()
        }
      }
      if (noIndex && robotsTag) {
        if (previousRobots) {
          robotsTag.setAttribute('content', previousRobots)
        } else {
          robotsTag.remove()
        }
      }
    }
  }, [title, description, noIndex])
}
