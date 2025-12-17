import { DiscoveryHeader } from "../components/Discover/Header";
import { DiscoveryCards } from "../components/Discover/DiscoveryCards";

export const Discover = () => {
  return (

    <div style={{display:'flex', flexDirection:'column',gap:20}}>
      <DiscoveryHeader />
      <DiscoveryCards />
    </div>
  )
}
