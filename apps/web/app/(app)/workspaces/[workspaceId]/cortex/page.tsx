import { CortexLab } from "@/modules/cortex/components/cortex-lab";

const CortexPage = async (props: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await props.params;
  return <CortexLab workspaceId={workspaceId} />;
};

export default CortexPage;
