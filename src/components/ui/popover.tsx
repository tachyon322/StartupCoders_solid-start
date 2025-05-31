import type { Component, ComponentProps, JSX } from "solid-js"
import { splitProps, createSignal, createEffect, onCleanup } from "solid-js"
import { Portal } from "solid-js/web"
import { cn } from "~/lib/utils"

type PopoverRootProps = {
  children?: JSX.Element
}

const PopoverRoot: Component<PopoverRootProps> = (props) => {
  return <div class="relative">{props.children}</div>
}

type PopoverTriggerProps = ComponentProps<"button"> & {
  asChild?: boolean
  ref?: (el: HTMLButtonElement) => void
}

const PopoverTrigger: Component<PopoverTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "asChild", "children", "ref"])
  
  return (
    <button
      ref={local.ref}
      class={cn("", local.class)}
      {...others}
    >
      {local.children}
    </button>
  )
}

type PopoverContentProps = ComponentProps<"div"> & {
  align?: "start" | "center" | "end"
  triggerRef?: HTMLButtonElement
  onClickOutside?: () => void
}

const PopoverContent: Component<PopoverContentProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "align", "children", "triggerRef", "onClickOutside"])
  let contentRef: HTMLDivElement | undefined
  
  const [position, setPosition] = createSignal({ top: 0, left: 0 })
  
  createEffect(() => {
    if (local.triggerRef && contentRef) {
      const triggerRect = local.triggerRef.getBoundingClientRect()
      const contentRect = contentRef.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      let top = triggerRect.bottom + 8
      let left = triggerRect.left
      
      // Adjust horizontal position based on align prop
      if (local.align === "end") {
        left = triggerRect.right - contentRect.width
      } else if (local.align === "center") {
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
      }
      
      // Ensure popover doesn't go off-screen horizontally
      if (left + contentRect.width > viewportWidth) {
        left = viewportWidth - contentRect.width - 8
      }
      if (left < 8) {
        left = 8
      }
      
      // Ensure popover doesn't go off-screen vertically
      if (top + contentRect.height > viewportHeight) {
        top = triggerRect.top - contentRect.height - 8
      }
      
      setPosition({ top, left })
    }
  })
  
  // Handle click outside
  createEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef &&
        local.triggerRef &&
        !contentRef.contains(event.target as Node) &&
        !local.triggerRef.contains(event.target as Node)
      ) {
        local.onClickOutside?.()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    onCleanup(() => {
      document.removeEventListener('mousedown', handleClickOutside)
    })
  })
  
  return (
    <Portal>
      <div
        ref={contentRef}
        class={cn(
          "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-lg animate-in fade-in-0 zoom-in-95",
          local.class
        )}
        style={{
          top: `${position().top}px`,
          left: `${position().left}px`
        }}
        data-align={local.align || "center"}
        {...others}
      >
        {local.children}
      </div>
    </Portal>
  )
}

export {
  PopoverRoot as Popover,
  PopoverTrigger,
  PopoverContent
}