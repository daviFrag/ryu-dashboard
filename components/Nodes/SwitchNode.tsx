import Image from 'next/image';
import { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import switchSvg from '../../public/switch.svg';

function SwitchNode({ data }: NodeProps) {
  return (
    <>
      <Image
        src={switchSvg.src}
        style={{ zIndex: 100 }}
        width={50}
        height={50}
        alt="Switch"
      />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </>
  );
}

export default memo(SwitchNode);
