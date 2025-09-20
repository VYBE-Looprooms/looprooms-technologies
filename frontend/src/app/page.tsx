import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturedLooprooms } from "@/components/featured-looprooms"
import { FutureLooprooms } from "@/components/future-looprooms"
import { CreatorHighlight } from "@/components/creator-highlight"
import { CreatorPerks } from "@/components/creator-perks"
import { Waitlist } from "@/components/waitlist"

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <HowItWorks />
        <FeaturedLooprooms />
        <FutureLooprooms />
        <CreatorHighlight />
        <CreatorPerks />
        <Waitlist />
      </main>
    </div>
  )
}