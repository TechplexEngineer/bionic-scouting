

function toClassName(value) {
    let result = '';

    if (typeof value === 'string' || typeof value === 'number') {
      result += value;
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        result = value.map(toClassName).filter(Boolean).join(' ');
      } else {
        for (const key in value) {
          if (value[key]) {
            result && (result += ' ');
            result += key;
          }
        }
      }
    }

    return result;
  }

  export function classnames(...args): string {
    return args.map(toClassName).filter(Boolean).join(' ');
  }