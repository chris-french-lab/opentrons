from opentrons import containers
from opentrons import instruments
#  from opentrons.robot import Robot

plate = containers.load(
    '96-flat',
    'B2',
    'plate'
)

tiprack = containers.load(
    'tiprack-200ul',  # container type from library
    'A1',             # slot on deck
    'tiprack'         # calibration reference for 1.2 compatibility
)

trough = containers.load(
    'trough-12row',
    'B1',
    'trough'
)

trash = containers.load(
    'point',
    'A2',
    'trash'
)

p200 = instruments.Pipette(
    name="p200",
    trash_container=trash,
    tip_racks=[tiprack],
    min_volume=10,  # These are variable
    axis="b",
    channels=1
)
p200.set_max_volume(200)
p200.calibrate_plunger(top=0, bottom=10, blow_out=12, drop_tip=13)

p200.pick_up_tip(tiprack[0])

p200.aspirate(10, trough[0])
p200.dispense(10, plate[0])

p200.drop_tip(trash)

# for t, col in enumerate(plate.cols):
#     p200.pick_up_tip(tiprack[t])

#     p200.aspirate(10, trough[t])
#     p200.dispense(10, col[0])

#     for well, next_well in zip(col[:-1], col[1:]):
#         p200.aspirate(10, well)
#         p200.dispense(10, next_well).mix(3)

#     p200.drop_tip(trash)
