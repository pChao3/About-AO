import InnerPageContainer from '@/components/common/InnerPageContainer';
import PageMetaTags from '@/containers/PageMetaTags';

export default function Page() {
  return (
    <InnerPageContainer title="Recent Activity">
      <PageMetaTags title="Recent Activity" description={'activity page'} url="/activity" />
      <p className="mt-12">We are reachable at - info</p>
    </InnerPageContainer>
  );
}
