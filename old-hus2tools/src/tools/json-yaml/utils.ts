import yaml from 'js-yaml';

export function jsonToYaml(input: string): string | { error: string } {
  try {
    const obj = JSON.parse(input);
    return yaml.dump(obj, { indent: 2, lineWidth: 120 });
  } catch (e) {
    return { error: 'JSON 解析失败: ' + (e as Error).message };
  }
}

export function yamlToJson(input: string): string | { error: string } {
  try {
    const obj = yaml.load(input);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return { error: 'YAML 解析失败: ' + (e as Error).message };
  }
}
