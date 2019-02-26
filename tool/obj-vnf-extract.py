import json
import sys
'''
type vec3  [float, float, float];
type uvec3 [uint, uint, uint];

data:{
    vertex: vec3[],
    normal: vec3[],
    face: {v: uvec3, n: uvec3}[],
}
'''

data = {
    "vertex": [],
    "normal": [],
    "face": [],
}

f = sys.stdin

while True:
    line = f.readline()
    if line:
        if line.startswith('vn'):
            line = line.strip().split(' ')[1:4]
            data["normal"].append([float(i) for i in line])
        elif line.startswith('v'):
            line = line.strip().split(' ')[1:4]
            data["vertex"].append([float(i) for i in line])
        elif line.startswith('f'):
            line = line.strip().split(' ')[1:]
            for i in range(1, len(line) - 1):
                a, b, c = (
                    line[0].split('/'),
                    line[i].split('/'),
                    line[i + 1].split('/'),
                )
                data["face"].append({
                    "v": (int(a[0]), int(b[0]), int(c[0])),
                    "n": (int(a[2]), int(b[2]), int(c[2])),
                })
    else:
        break

print json.dumps(data)
