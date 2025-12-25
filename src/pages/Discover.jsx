import { DiscoveryHeader } from "../components/Discover/Header";
import { DiscoveryCards } from "../components/Discover/DiscoveryCards";

export const Discover = () => {
  return (
    <div className="discover-container">
      <DiscoveryHeader />
      <DiscoveryCards />
    </div>
  );
};
