#!/usr/bin/env python3
"""NovaBank ACC Bootcamp | A14: generate a large nvb_scores_YYYYMMDD.csv (default 200,000 rows).
Usage: python3 generate_scores.py 200000 20261001 > nvb_scores_20261001_full.csv"""
import csv
import random
import sys

n = int(sys.argv[1]) if len(sys.argv) > 1 else 200000
day = sys.argv[2] if len(sys.argv) > 2 else "20261001"
random.seed(day)
w = csv.writer(sys.stdout)
w.writerow(["customer_id", "model_code", "score", "decile", "scored_on"])
for i in range(n):
    s = round(random.random(), 4)
    w.writerow([f"NVB{(i // 2) + 1:06d}", "CC_PROPENSITY" if i % 2 == 0 else "PL_PROPENSITY",
                s, min(10, int(s * 10) + 1), f"{day[:4]}-{day[4:6]}-{day[6:]}"])
