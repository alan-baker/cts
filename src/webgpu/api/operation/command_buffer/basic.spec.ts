export const description = `
Basic tests.
`;

import { makeTestGroup } from '../../../../common/framework/test_group.js';
import { GPUTest } from '../../../gpu_test.js';

export const g = makeTestGroup(GPUTest);

g.test('empty').fn(async t => {
  const encoder = t.device.createCommandEncoder();
  const cmd = encoder.finish();
  t.device.queue.submit([cmd]);
});

g.test('b2t2b').fn(async t => {
  const data = new Uint32Array([0x01020304]);

  const src = t.device.createBuffer({
    mappedAtCreation: true,
    size: 4,
    usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  });
  new Uint32Array(src.getMappedRange()).set(data);
  src.unmap();

  const dst = t.device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  });

  const mid = t.device.createTexture({
    size: { width: 1, height: 1, depth: 1 },
    format: 'rgba8uint',
    usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST,
  });

  const encoder = t.device.createCommandEncoder();
  encoder.copyBufferToTexture(
    { buffer: src, bytesPerRow: 256 },
    { texture: mid, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
    { width: 1, height: 1, depth: 1 }
  );
  encoder.copyTextureToBuffer(
    { texture: mid, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
    { buffer: dst, bytesPerRow: 256 },
    { width: 1, height: 1, depth: 1 }
  );
  t.device.queue.submit([encoder.finish()]);

  t.expectContents(dst, data);
});

g.test('b2t2t2b').fn(async t => {
  const data = new Uint32Array([0x01020304]);

  const src = t.device.createBuffer({
    mappedAtCreation: true,
    size: 4,
    usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  });
  new Uint32Array(src.getMappedRange()).set(data);
  src.unmap();

  const dst = t.device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  });

  const midDesc: GPUTextureDescriptor = {
    size: { width: 1, height: 1, depth: 1 },
    format: 'rgba8uint',
    usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST,
  };
  const mid1 = t.device.createTexture(midDesc);
  const mid2 = t.device.createTexture(midDesc);

  const encoder = t.device.createCommandEncoder();
  encoder.copyBufferToTexture(
    { buffer: src, bytesPerRow: 256 },
    { texture: mid1, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
    { width: 1, height: 1, depth: 1 }
  );
  encoder.copyTextureToTexture(
    { texture: mid1, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
    { texture: mid2, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
    { width: 1, height: 1, depth: 1 }
  );
  encoder.copyTextureToBuffer(
    { texture: mid2, mipLevel: 0, origin: { x: 0, y: 0, z: 0 } },
    { buffer: dst, bytesPerRow: 256 },
    { width: 1, height: 1, depth: 1 }
  );
  t.device.queue.submit([encoder.finish()]);

  t.expectContents(dst, data);
});
