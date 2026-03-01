import { Link, useRouterState } from "@tanstack/react-router";
import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Home } from "lucide-react";

export function Breadcrumbs() {
  const routerState = useRouterState();
  const breadcrumbs = React.useMemo(() => {
    return routerState.matches.map((match) => {
      const { pathname, context } = match
      return {
        path: pathname,
        title: context?.title ?? ""
      }
    }).filter(({ path, title }, i, arr) => {
      return !path.endsWith("/") && title !== "" && (i === 0 || arr[i - 1].path !== path)
    })
  }, [routerState.matches])

  return <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        {breadcrumbs.length === 0 ?
          <BreadcrumbPage className="flex gap-2 items-center"><Home className="w-4 h-4" /><p className="text-sm font-semibold">CaféTrackr</p></BreadcrumbPage>
          :
          <BreadcrumbLink asChild>
            <Link to='/'><Home className='w-4 h-4' /></Link>
          </BreadcrumbLink>
        }
      </BreadcrumbItem>
      {breadcrumbs.map(({ path, title }, index) => {
        return <React.Fragment key={path}>
          <BreadcrumbSeparator />
          <BreadcrumbItem >
            {index === breadcrumbs.length - 1 ?
              <BreadcrumbPage>{title}</BreadcrumbPage>
              :
              <BreadcrumbLink asChild>
                <Link to={path}>{title}</Link>
              </BreadcrumbLink>}
          </BreadcrumbItem>
        </React.Fragment>
      })}
    </BreadcrumbList>
  </Breadcrumb >
}
