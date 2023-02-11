import Image from 'next/image';
import { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import controllerSvg from '../../public/controller.svg';

function ControllerNode({ data }: NodeProps) {
  return (
    <>
      <Image
        src={controllerSvg.src}
        style={{ zIndex: 100 }}
        width={50}
        height={50}
        alt="Controller"
      />
      {data.label}
      <Handle type="source" position={Position.Bottom} isConnectable={true} />
      <Handle type="target" position={Position.Top} isConnectable={true} />
    </>
  );
}

export default memo(ControllerNode);
