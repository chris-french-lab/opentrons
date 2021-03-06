"""
An easy entrypoint for simulating a protocol offline.
"""

import argparse
import json
import sys

import opentrons
import opentrons.protocols


def simulate(protocol_file):
    """
    Simulate the protocol itself.

    This is a one-stop function to simulate a protocol, whether python or json,
    no matter the api version, from external (i.e. not bound up in other
    internal server infrastructure) sources.

    To simulate an opentrons protocol from other places, pass in a file like
    object as protocol_file; this function either returns (if the simulation
    has no problems) or raises an exception.

    To call from the command line use either the autogenerated entrypoint
    opentrons_simulate(.exe, on windows) or python -m opentrons.simulate.

    :param file-like protocol_file: The protocol file to simulate.
    """
    contents = protocol_file.read()
    if opentrons.config.feature_flags.use_protocol_api_v2():
        try:
            execute_args = {'protocol_json': json.loads(contents)}
        except json.JSONDecodeError:
            execute_args = {'protocol_code': contents}

        execute_args['simulate'] = True
        opentrons.protocol_api.execute.run_protocol(**execute_args)
    else:
        try:
            proto = json.loads(contents)
        except json.JSONDecodeError:
            proto = contents
        if isinstance(proto, dict):
            opentrons.protocols.execute_protocol(proto)
        else:
            exec(proto, {})


# Note - this script is also set up as a setuptools entrypoint and thus does
# an absolute minimum of work since setuptools does something odd generating
# the scripts
def main():
    """ Run the simulation """
    parser = argparse.ArgumentParser(prog='opentrons_simulate',
                                     description=__doc__)
    parser.add_argument('protocol', metavar='PROTOCOL_FILE',
                        type=argparse.FileType(),
                        help='The protocol file to simulate.')
    parser.add_argument('-v', '--version', action='version',
                        version=f'%(prog)s {opentrons.__version__}',
                        help='Print the opentrons package version and exit')

    args = parser.parse_args()

    simulate(args.protocol)
    print("Simulation successful!")
    return 0


if __name__ == '__main__':
    sys.exit(main())
