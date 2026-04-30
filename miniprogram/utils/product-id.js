/**
 * 从页面 options 中提取产品 ID
 * 支持 id / productId / pid 参数，以及小程序码 scene 参数
 */
function getProductIdFromOptions(options) {
  options = options || {};

  if (options.id || options.productId || options.pid) {
    return options.id || options.productId || options.pid;
  }

  if (!options.scene) return '';

  let scene = String(options.scene).trim();
  try { scene = decodeURIComponent(scene); } catch (e) {}

  if (/^[A-Za-z0-9_-]+$/.test(scene)) return scene;

  const query = scene.includes('?') ? scene.split('?').pop() : scene;
  const pairs = query.split(/[&;]/);
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    const key = pair.slice(0, eq);
    let value = pair.slice(eq + 1);
    try { value = decodeURIComponent(value); } catch (e) {}
    if (['id', 'pid', 'productId', 'p'].includes(key)) return value;
  }

  return scene;
}

module.exports = { getProductIdFromOptions };
