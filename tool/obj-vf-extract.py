import json
import sys
'''
type vec3  [float, float, float];
type uvec3 [uint, uint, uint];

data:{
    vertex: vec3[],
    face: uvec3[],
}
'''

data = {
    "vertex": [],
    "face": [],
}

f = sys.stdin

while True:
    line = f.readline()
    if line:
        if line.startswith('v'):
            line = line.strip().split(' ')[1:4]
            data["vertex"].append([float(i) for i in line])
        elif line.startswith('f'):
            line = line.strip().split(' ')[1:]
            for i in range(1, len(line) - 1):
                data["face"].append((
                    int(line[0].split('/')[0]),
                    int(line[i].split('/')[0]),
                    int(line[i + 1].split('/')[0]),
                ))
    else:
        break

print json.dumps(data)
