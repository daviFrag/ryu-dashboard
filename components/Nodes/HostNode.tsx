import Image from 'next/image';
import { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import hostSvg from '../../public/host.svg';

function HostNode({ data }: NodeProps) {
  return (
    <>
      <Image
        src={hostSvg.src}
        style={{ zIndex: 100 }}
        width={50}
        height={50}
        alt="Host"
      />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </>
  );
}

export default memo(HostNode);
