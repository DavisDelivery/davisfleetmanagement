const APP_VERSION = "2.9.5";
const DAVIS_LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCACMARgDASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAEHBQYIBAMC/8QATRAAAQMDAgMFAwYJCAgHAAAAAQIDBAAFEQYhBxIxExRBUWEigZEVMkJScaEII2JzgrGywdEWJCUncnSSsxcmMzY3Q3XCU1VWk5Si0v/EABkBAQADAQEAAAAAAAAAAAAAAAADBAUCAf/EADARAAICAgEBBQgBBAMAAAAAAAABAgMEERIhEzFBUXEFFCJhgaGx8CPB0eHxFTOR/9oADAMBAAIRAxEAPwDqMCpqE9KmgFMUpQCmKUoBilKUApSlAKUpQClKUAqMVNKAUpSgFKUoBSlKAUpSgGKUpQDFKUoBSlKAUpSgFKUoCKUNKACpqBU0ApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQClKUApSlAQaUNKACpqBU0ApSlAKUqM0BNK1u6a50xa5Lke4X63MPtnlW2p4FST5EDofSvg3xF0gtXKNR21J/Le5f1132c+/TOHbBdNo2ulYy36gs9xIFvu1vlE9AzJQs/AGsnXLTXedJp9wpSleHp550yPAirkzX2o8dvdbrqglKd8bk+tYr+WGnP8Az61//JT/ABrFcXxnhzev7Df+YmuZosV6XKajRWlOyHVBDbaRupR6AVpYWDHIrc5S1ozczNljzUIrezrBGrdPLUEpvtsJPh3lH8ay0aSxKa7SM80839dtYUPiK5Vd0RqhpBWuwXDlG5w1zfcKx1ruVysM4u2+RIgymzhQTlBz5KSev2EVY/4uE1/FZt/vkQL2nOD/AJIaR2BStF4X64Tq2C4xMShq6xgC6lOyXEnYLSPDfYjwP21vNZNtcqpOE11Rq1WRtipxfRniud2t9qQ2q5zo0RLhKUF9wICiOoGa80LUtknSm40K7wJEhzIQ22+lSlbZ2ANUPxtvvytrBUNpeY1uT2A8i4d1n44H6NaTapz1rucSfGOH4zqXUepBzj39PfWpT7K51Kbem0ZdvtTha4JbSOv5kpiFGcky3m2I7Y5luOK5UpHmT4ViBq7TpIAvtsydsd5T/GvU0uHqPTyVDC4NwjdPyFp/WM/dXJt5trtqusy3Sh+NjOqZV64PX3jB99V8LDhkOUZPTRYzMuWOoyitpnYopmtU4X3v5d0XAkOL5pLKe7P+fOjbPvGD76zOpLq3ZLFOuT2OSM0pzB8T9Ee84FU5VyjN1+O9FyNsZQ7Tw1s+EnVNhjSHGJN5tzTzailba5CQpJHUEZ2Nelu9W122ruLdwiqgIzzSA6C2nBwcq6VyIovzpqlKy7Kku58ytaj+8muiNWWduw8Gp1sawe7w0pUR9JfMkqPvJNX8jAhS4R5dZMoY+dO5Tlx6RRtLGqrBIebZYvVucdcUEoQiQklROwAGetZnxrknR3+91k/vzP7YrobirqV3TOlXZEMhM2Q4I7CjvyE5JV7gD78VxlYPZWRrg9uR1jZ3a1ysmtJGZveprLY1BN2ucWKs79mtft4/sjf7qxcbiHpOS4EN3yKFH/xApA+KgBXNVst9x1Bd0xoaHJdwkqKiVKypR6lSlH9ZrYbnw21Xbo6nnLYX2wMq7s4l0j9Eb/AVbfs2iGo2WdfoVl7Rvn8VcOn1Om48hmSyl6O6260rdK21BST9hFfWue+BEK7PakediyX41sij+dNj5rijslBSds+OeoA9a6ErMyqFRZwT2aWLe76+bWhSlKrlgg0oaUAFTUJqaAUJxSvHPgMz0huWFOMeLJVhC/7QHzh6Hb0oeM1+46tW+6uJpSA5epqTyqdQrkiMn8t47Ej6qcn7KrvXFp1CzqDSMrUV9MtyXdm0dyipLcZlKfb2GcqO3U1djLSGWkNtIShtAwlCQAEjyAHSq+4rJ5rxoo/Vua1fBhZ/dVqiaUtRXn+CtfBuG5Py/JzLAvlxiXJ56E6VrfcUtxlbYdbdySSFNkEKznyrpXhdN79ZGHhCciRieyft0xBAjL+uwpzctH6pJ5fDpg85aNQufNTDMqSw2vshlhwoI5nm0E5HXZZ61dE7htpy18RdPwJLMmdbrlGkoKZUlayX2wFA5BB+bnbpWhmcH8L6P+xQxOa+JdV/ctSXpnT9xBEqzWuQT4qjNk/EDNYZ1t3RDrbzbz72mHFht5p5RWq3knCVoUdyznAUkk8ucjbIr4nhPoz6FmU2fNuS8k/cqvnK4VWJyI9GjSb3EbdQW1JbuTpSQRggpUSCPQ1mqUO5yevT/JouM+9RW/X/AAb6Kmte0BLXL0hay/nvDDXdXsnJ7RoltWfekn31sNQSXFtE0XySZpvGBSUcOL0pZCUhCMk/nE1z9oRSTrjT+FDec1jfr7VXzxwP9Vl//Nt/5qK5k4an+sXTX/UGf2q2fZ8tY816/gyM6HLIg/T8nagFVL+EHY2FabF/YaQJsRxCHV4wXGlHlwfMgkEH7atodKqb8I6/xoGixaO0SZtxdRhvO4bQrmUo+mQB7/Ss7DcldHj5mhlKLplyKn4R38ROIVm5eZBkPd2WOoUFjGPjg+6umtXXpGn9Nz7mvBUw0S2k/SWdkj4kVydwfgOXLiXYG2wSGpAkrPklsFRP3Ae+re47/LWpblbdLabhSZamsS5amhhCFHIbClnAG3Mrc+IrQzYxsyIqXl19CjiN148uPn09SpIkeTeLszGbJclzHgjmPUrUdz8Tmtq4r6Yb0xqFpqIOWDIYQton6yQEr+8Z/Sr76atNr4Y3tm7ayvrEi5sNq7G1QcvuIWoY5lHYAgE9cDfrWYGtNUcSJuNL2WBbYEQnN1noS6Y48SFKHKFYHRIJ9R1qzPLl2inBfAl6IqwxI9m4zfxt+ptPBa9KiaNeZvfNCiRHfxEmUOybWhe+EqVgHBz08xWvcc7ZZ2Et6mXLlIcmpSy2w1H2ecSDhRUrHKOXHhvjbNYO16w0/addWltyQ9qWSZCWZV8uKypLXNsO7oJwhIJGVeWcedW9xb06dS6DucNtHPLZT3mP59ojfHvHMPfVCU3VkKzu5F6Natx3W+vEqz8HXVKBfplkdygTG+2aBO3aI6gfan9mtp/CBvfY2uBZmle3JX3h4D6iNkj3q3/RrnPTd3eseoLddY2e0iPodA+sAd0+8ZHvrYeJerl6j1pcLhEdV3LIajAj/lpGAcHpk5Pvq88feUrX3d/1Kau1jOpd/wDQ3fgpY/lbWbcl1HNHtye8KJ6c/RA+OT+jVycVh/V5ffzH/cmsNwHsrls0JHmSxiXc1d6VtghHRsf4d/0qyfGNxTXDPUK0bKTH2/xpqhkX9rlp+CaX3LuPR2WK14tNnPejj/rfZP78z+2KvDjtaX7jo9EiKhTioL/buJSMnkIKVH3ZB+zNc46JlvP6508HFkj5RY2Gw/2grtCW8zGjvPyXENsNpUtxazhKUgZJPpirPtC5wvhOPgV8CjnTOEn3nI+mb7L07eGblbi327YKeVwZStJ6g+hq37Nxqgu8qLzbH46vFyOsOJ+3Bwf11lLxwx0xqZhNxs764XeE9oh6CpKmXM+PIcj4Yqr9d8Lr9pm1SbnFlxLlBjpK3SlstuoT4q5ckEDxwfdUkrsTLa7RakRxpy8VPs3tHQWm7xZ71GdlWORHeQtXM72Y5VcxHVY2OcDx8qzFcXaC1VPsGr7dOZeUGy8hp9sbJcaUoBSSPfkeRArtHzHlWXmY3YT0ntM08TId0eq00KUpVQtg0oaUBCelTUDpU0ApSvPLlpipBU28vPQNNlZ+6gb0eiq+4pjNz0mfqzJCvhEdP7qyFw13GilSUW+QtQ2/GSorA/8Au6D91aVfdTq1Ld7Sh0WeCiKt9SQb0w866txhxpCAhGdypY8as01yT5P5/grXWRceK+X5OerHIXGblOMrU26mMFIWk4KVBxsgj1yKyd01nqK6rhKuN4lyFQ1lxhZVyrbURgkKSAenrX1j6H1a22pI05dPab7M5YI8v4V+mbTD08UPauW9DkuKKWIQiCQ5gHBcWgrSAnOwGSSQcDatyU697em//TGjGzuW0Zmw6/DBAuyblJ81ruEhX7LiSPvq1NJ6m0vfGJjqpN4tbcNtLj0r5Yf7FHMrlSCVKBCiegKffWg6dixNTzJlkk6Ut1wdZYEhmfZFphOraOMOJSohK+o2OMdCKxLNscs1o19aHkyEKajxHkiQ12bmBITjKckA4X4EjyJFVJ112dF0fTx82WYTnX1fVdfDyLig32x2RDo07rm1vJddU+uNdXg4la1HKiHU4WnJ8+YelbvpTUTd+Yf/ABSWpDBTzpbeS82tKhlK23E7KQQDvgHIIIGK4pVnPjV+8Gb1JtaLWx8muvW2XCjNvzEKAEZwvvpb5h4hRUBtuOvSosrDUIck9slxstylxa0jfeOO3Cu//m2/81FckW2fJtdyjT4K+zlRnEutL5QrlUDkHB2Ndx3u1Qr5a37ddY4kQnwA40VEBWCCNwQeoFal/oj0N/6fZ/8Aed//AFUWJlwpg4TW9kuViztmpRZz69xe1y62UfLRQDtluM0k/HlrUXXrpqG7ZcVLudzkKA35nXVnwHn+4V1kjhPodCsjT0c4+s64R96q2Wy2C0WNsos9thwkkYPYNBJV9p6mpvf6oL+OHX6Ii9ytn/2T6FWcNtNQOFenpOodYSGo9xkpDfJnmLSOoaSB85ZIBOPIDoCa0DX/ABmvF+L0Sxc9otisglCvx7o81KHzfsT8TXQWpdEae1NLbk32399dbTyNlbzgCB6JCgB67b1i2OFOiGHm3W9Px+dtQWnmccUMg53BVgj0NQV5FXJ2WpuX2Jp0WcezraUfuU7wn4RPahS1edTh1i1rPaNR8lLkr8onqlB8+p9BvXQ8ix293T71lTGaZtrrCo3YtpCUpQoYOB76yYwAMYxTNV7sid0uTJ6aIVR0jhC92x+z3ebbJgIfiPKYWfMpOM+8b++uv+E2o/5T6Fts5xXNLbT3eR+cRsT7xhXvr933h1pS+3R643azNSJj2O0dLi0lWAANgoDoBWS0xpezaWYfZsMIQ2n1hbiEuLUCoDAPtE42qxk5UL60tdV+sgx8adM299Gcn8W9PfyZ17c4baOWK6vvUfbbs15OB9h5h7qxeiLE5qbVdstCAeWS6A6R9FsbrP8AhBrr7U2i9PaokMP322NzHmUFttalrSQknOPZIzvXx03oTTGnJ5n2O1NRpRQWu1S4tfsnGRuojwFTx9opVcdPloheA3ZvfTZsrDSGGW2mUBDSEhKEgbJSBgD4VpnGj/hdqL+7f96a3XNeO8WyHerZIt9zYEiHITyOtEkcwznGRv4VmVy4zUn4GjOPKLiji7Qe2utPf9RY/wAwV0H+EUdRr0w3HssRx21LUVXBxnKnAkfNSUjfk8SR5AHA67NB4XaMgTo8yJY2m5MdxLraw84eVSTkHBV5it0z8au35kZ2Rsiu7zKdOLKFcoSff5HE+ktcX/Sij8iXFbTCjlTCwHGlHz5TsD6jBrYdUcX9Taisr1rkmFHjPp5HjGZKVOJ8U5KjgHxxXROoOHGkr86p642WN26t1OsZZWfUlBGffWEicFtEMuBw26Q+OoS7LcUk/AjNTe+Y8nzlDqRe6XxXGMuhQHCfSkrVer4aG2lGBFdQ/Lex7KEpOeXP1lEYA+0+Fdk9a8VotcGzwkQ7XDYhxUfNaZQEpz57dT617apZWQ75b1pIuY1CpjrxYpSlViwDShpQEJqahNTQCqh4vaMvN01LF1Jb3GTCtkJSltlxQc50dooFKQME5Kcb+FW9XjuVth3Jrs50dDyOmFZ/dUldjrlyRHZWrI6Zybqmw6Wi2zWb1rcZW5Cnw2oBS7zZbWjKwN/aBPNvvjlrW9FxZ7NxZujFvnOxmw82mSxGW4lt0tKCTlIO6VKSfTrXUEzg5oSUD/QLbCj4x3nG8fBWK/MThbGtcMRdP6l1NaY4UVJZjzEqbBO5PKpJq+s2Ki49fqUXiS5b/ByqxbHVIHfJrcFwD5kxL6CPfyEffVvcCrJZdVXO9fKkePNaiWyJCaS4kKCApB7RQz0VzZ36jerBl6B1ilJ+TuJV0HkmXEbcHxH8K0+Vwx4lRrrNulv1XbXZsuP3V5wILCnG/AEBBGR4HqPOk8hWxa5a/fQRx3XLet/vqUpY7t8izOeOZQkR3FttSY8xTKwjJGBgEY6/Gtta1oVXBybOcuk512OYjiZjjMlDjPNzcigpsZHNuPWvRb+D+u7Jc25LdhtFzCAU9nIebdZORjJSop91bbF0jrUY7fhtoRQ/KSlP6nDViV9Xjp/UgjRb4bX0NMVqqwnc6ehZ/uEcV97RqZdy1PaIkLvbLbsyKhMVDrbbGEODlHZIQM43PXrvWQ1Jwe1ffbkJcew2GzAoCVMRZmGiR9IJwcHHXHlmt64Q6AvmhkyXJdltsydIUMyflDBbSM4ShPZHHUknO+3lXE76VDaW36nUaLXLTfT0Nq48q5eFt5VzFOFMbg427ZHjWu6ZFotfFO2W/Qs8yLZIgvOXSOzLVIYaIx2a8kkJUTt1q1HojVzt6o13gx3GnMc8dzDyDg5GcjB39KWu0260tKbtcCJCbUcqTHZS2CfXAGazY2qMOHqaEqnKfL0KCtka3TOIWoV3OJZnwi/rSHpt5XFebSFJPsNA4Xg7jPU7Vv8APusK18c3XLnPjw2Dp9ICpDyW0lXbk/SIGcA1uL+lNPSJa5T9itbspa+0U8uIhSyrOeYkjOc+NebV8XTDMVd11PAtzyGkhvtZMVLyzk7ISMEk5JwB61JK6M31Xho5jS4rp57Nevjwc4z6OU06FNLts1aSlWUqGE4PrWiamTPtmorxw8hB4R9STmZcR0E/iY7hJkgHwAKD7s1eLEO3uuRJjcWOXGWuSO72QCm21Aeyk4ykEY2r8zUWxufFmTUwkTEhbTD73KHACkqUlCjv0BJA8ATXELlHXTw/rtHUqnLxKf4xxYidZ6UgrjQHobcCQlLE2eqGzhJSE5cG4IxsPGvrr9mMzwbsUeBGjFg3GMju0GaX21Euq5m0vE5OSSMk7Z9KspljTesoTFwXBhXSOCttp2TFCsYVg8vOM4yPsOxrIoslpRAZgotsJMJlYcbjhhIbQsHIUE4wDnfPnXSv0oryPHTtyfmVZwgiszLzrSKmE5bLUns4blkkSlPraXynnWck4CgcAg4OPSvzw3sk17W0y33eeZcDRqjGt6CTzKLuVJWvzKW8JFW03b4TdwenNxY6JryQhyQlsBxaR0BV1IHrX7YhxY8iQ/HjstPyFBTziEAKdIGAVEbkgbb15K/fLXiI0618jXuKCUL0Bem3Lqi0JWxyd8WVBLeVAblO+D83bzrR+CsiBHu15tEe3Qo81qK087JttwVKivpOQCASeRZzkjqfdVpQ5sC8MS0MKblMNPORXgUZTzoOFp3GFYOx6jII8K+VkgWaAJLNki2+MkOcr6IaEJw5jOFhP0sEbHfeuI2ag4M6lXuamiieB8WAudZpUiHZjK7R4plKvK+9lWVhI7tnHp9m9Y/iIWW9Ta/ku2iTIdblR2mLmiYplFuWtpISpQBzjO+cY29a6Bi6W09EltyoljtbEltXMh1uKhK0nzBAyDUXJFgiKkN3JNsZNyB7ZL4QnvIQgklYPzglIJJPQCp/eVzc9fu9kXu74KO/3RovELvOnIOk9YKeVLds/Zx7i40ciRHdSErV5H2sEH8qsN3WSngVq6/z+ZNwvzT1xcyTlCFHDSR5AJx8aspy6aXXp4NuP21VnP8ANQypILZwM9nyY8E74x036V9n7npyQ41YX5dreVJZSEQFLQrtGiMpwjxSQNvDAqNW6SWu5/bvJHV1b3/srzX7zKo+gLffJbsTS0xGJ7qXC2lawyktIWsdEk58f1Vk4UXS8DRGtGNGXDvEduK8Xmm5Snm46+xVsgknGepwTv8AZViSYESVCMOVFYeiFISWHGwpGB0HKdq+cO0W6Hb1QIkCKxBUClUdplKW1AjBBSBg58a87VcUv9d47J7bKb4FRLemVb5PdLK3NVb8h+PeVvyXCQnm52CcIyNzjodqvKsPbtM2K1yhJttmtsSQAUh1iMhCwD1GQM1mK5us7SXJHdUOEeIpSlREgpQ9KUBAqagdKmgFKUoBSlKAUpSgFKUoBSlKAg0qaUBFVTxDlXS56ybh2FL779nhqlJabKCO8uFKAooWMK5GVuKwSAStI2q168TFrhR7lKnsRWUTZQSl95KfbcCRhIJ9BXsXo8ktlUJg8RJTb0Zp+6W5AkLDbzz7LyiFupQg53yhttC3VdCpbgSMAV47hB1xd4T0G6W66ORXFKSXFqjqcS27JIc5dx7SWEhKemQ64TsADd+K/DzLbzS2nUhTa0lKknoQRgiuufyOeBVHC26Xy4XuTGMd1m2W0PIdbDyFNJecXzIaCk55whtKNx1LqlHwFedSeJYjMzY4lqkOtlT0N4spCJCWnDsQfZY5y2kJGSrs8nHMTVq2e0wrNBTDtkdEeOklXKnJyT1JJySfUmvbgU5de4ceneU/MgcQyXVMyrkljEcpSh1ovKKy2hec+yOzQ2tZxsVPHBIBr5SF8SXkPvdznpdkJfLkdp5pCGnEcxZQ2oqyEKykFYAJ5AOqiRcuBTApz+Q4fMrWTC1BatNaYt1htssrjOtPSWw8hPa4WFLS85zeyVZWs4CgVbZIznBwo/ERKIsxEWU08X0KeihTDYkOBtbjjjpH0FLLbA35ghvJ3xVzYFMCvFL5DiVNGa1y/OtTf9LtRHUNyJLr62Uq7wCntEEJJ7NrAVge1nmOBsKyOtNMu3++XWXKgyQzHhtRIKozba3H3FOJccV7RA5ByNowogYLngasjFMU5eJ7xKSuuj9UvOIU+HH7s7LTce8x1BLKnHSGnmXF5BS0mOhCPZGVE5B2xW46Xt9wY1i/JhRLhbrG5HUZLE5SCFyPYS2GUpzypQ2gpyDykcoGcE1vmKnFHNsKGgKUpXJ0KUpQClKUBB6UqT0pQEDpU1AqaAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgIPSlD0pXgAqa/NTnavQTSozQGgJpUZpnagJpUZpmgJpUZ3oTQE0r85qc0BNKjNM0BNKjNM0BNKjNCaAmlRmmaAmlfnNTmgJpX5zU5oCaVGaZoCaVGaZoCaVANM0BNKjNM0BNKjNR40BJNKilAf//Z";

const ST = [
  {id:"0154",mk:"FRTLN",tr:"A",ax:"Single"},{id:"0294",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"0608",mk:"FRTLN",tr:"A",ax:"Single"},{id:"0805",mk:"HINO",tr:"A",ax:"Single"},
  {id:"0878",mk:"INTL",tr:"A",ax:"Single"},{id:"1478",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"1972",mk:"FRTLN",tr:"M",ax:"Single"},{id:"2403",mk:"HINO",tr:"A",ax:"Single"},
  {id:"3299",mk:"FRTLN",tr:"A",ax:"Single"},{id:"4114",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"4757",mk:"HINO",tr:"A",ax:"Single"},{id:"4952",mk:"HINO",tr:"A",ax:"Single"},
  {id:"5042",mk:"FRTLN",tr:"A",ax:"Single"},{id:"5075",mk:"Ford",tr:"A",ax:"Single"},
  {id:"5293",mk:"FRTLN",tr:"A",ax:"Single"},{id:"5588",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"5983",mk:"FRTLN",tr:"A",ax:"Single"},{id:"6178",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"6271",mk:"FRTLN",tr:"A",ax:"Single"},{id:"6664",mk:"HINO",tr:"A",ax:"Single"},
  {id:"6892",mk:"HINO",tr:"A",ax:"Single"},{id:"7521",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"7569",mk:"HINO",tr:"A",ax:"Single"},{id:"7933",mk:"INTL",tr:"A",ax:"Single"},
  {id:"8257",mk:"HINO",tr:"A",ax:"Single"},{id:"9445",mk:"HINO",tr:"A",ax:"Single"},
].map(x=>({...x,type:"straight"}));

const TR = [
  {id:"0186",mk:"Tractor",tr:"M",ax:"Single"},{id:"0367",mk:"Tractor",tr:"M",ax:"Tandem"},
  {id:"0423",mk:"Tractor",tr:"M",ax:"Single"},{id:"0424",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"0451",mk:"Tractor",tr:"M",ax:"Tandem"},{id:"0877",mk:"Tractor",tr:"A",ax:"Tandem"},
  {id:"0920",mk:"Tractor",tr:"M",ax:"Single"},{id:"1287",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"1368",mk:"Tractor",tr:"A",ax:"Single"},{id:"1502",mk:"Tractor",tr:"A",ax:"Tandem"},
  {id:"1506",mk:"Tractor",tr:"M",ax:"Tandem"},{id:"1606",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"1637",mk:"Tractor",tr:"M",ax:"Single"},{id:"1874",mk:"Tractor",tr:"A",ax:"Single"},
  {id:"2195",mk:"Tractor",tr:"M",ax:"Single"},{id:"2561",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"2617",mk:"Tractor",tr:"M",ax:"Single"},{id:"2618",mk:"Tractor",tr:"M",ax:"Tandem"},
  {id:"2883",mk:"Tractor",tr:"M",ax:"Single"},{id:"3889",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"3977",mk:"Tractor",tr:"A",ax:"Tandem"},{id:"5078",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"5255",mk:"Tractor",tr:"M",ax:"Single"},{id:"5924",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"5933",mk:"Tractor",tr:"A",ax:"Single"},{id:"6560",mk:"Tractor",tr:"A",ax:"Tandem"},
  {id:"6957",mk:"Tractor",tr:"A",ax:"Single"},{id:"7369",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"7608",mk:"Tractor",tr:"M",ax:"Single"},{id:"7750",mk:"Tractor",tr:"M",ax:"Tandem"},
  {id:"7773",mk:"Tractor",tr:"M",ax:"Single"},{id:"8829",mk:"Tractor",tr:"A",ax:"Tandem"},
].map(x=>({...x,type:"tractor"}));

const ID=[
  {n:"Aaron Mitchell",r:"Davis Straight Driver",c:"Davis"},
  {n:"Allen Council",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Anthony Kostner",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Brent Bryd",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Brent Dixon",r:"Davis Straight Driver",c:"Davis"},
  {n:"Brian Worley",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Che Roberts",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Chris Head",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Darvin Cepeda",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Denis Salkic",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Enock Akyea",r:"Davis Straight Driver",c:"Davis"},
  {n:"Garry Pitts",r:"Davis Tractor Driver",c:"Davis"},
  {n:"James DAVIS",r:"Uline Shuttle Driver",c:"Davis"},
  {n:"Jew Williams",r:"Uline Shuttle Driver",c:"Davis"},
  {n:"Jim Pallette",r:"Davis Tractor Driver",c:"Davis"},
  {n:"John Thompson",r:"Davis Straight Driver",c:"Davis"},
  {n:"Johnathan Sailers",r:"Uline Shuttle Driver",c:"Davis"},
  {n:"Junior Thomas",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Leroy Smith",r:"Davis Straight Driver",c:"Davis"},
  {n:"Leslie Thomas",r:"Uline Shuttle Driver",c:"Davis"},
  {n:"Mandi Malbrough",r:"Davis Straight Driver",c:"Davis"},
  {n:"Marcus Crumpton",r:"Davis Straight Driver",c:"Davis"},
  {n:"Marcus Young",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Mareese Johnson",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Michael Frye",r:"Davis Straight Driver",c:"Davis"},
  {n:"Michael Tharp",r:"Davis Straight Driver",c:"Davis"},
  {n:"Montel Bishop",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Rasheed Davis",r:"Davis Straight Driver",c:"Davis"},
  {n:"Rasko Suljic",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Robert Best",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Scott Hart",r:"Davis Straight Driver",c:"Davis"},
  {n:"Tariq Hammou",r:"Davis Straight Driver",c:"Davis"},
  {n:"Terrance Hawk",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Terrence Taylor",r:"Davis Straight Driver",c:"Davis"},
  {n:"Terry Gambrell",r:"Davis Straight Driver",c:"Davis"},
  {n:"Trevarr Howard",r:"Davis Straight Driver",c:"Davis"},
  {n:"Trevor Syers",r:"Davis Straight Driver",c:"Davis"},
  {n:"Victor Fernandez",r:"Davis Tractor Driver",c:"Davis"},
  {n:"William Goodwin",r:"Davis Tractor Driver",c:"Davis"},
  {n:"William Kidd",r:"Davis Straight Driver",c:"Davis"},
  {n:"Anthony Bennett",r:"Owner Straight Driver",c:"Owner"},
  {n:"Ben Paintsil",r:"Owner Straight Driver",c:"Owner"},
  {n:"Colin Calhoun",r:"Owner Straight Driver",c:"Owner"},
  {n:"DJ McCrary",r:"Owner Straight Driver",c:"Owner"},
  {n:"Frank Okine",r:"Owner Straight Driver",c:"Owner"},
  {n:"Fred Andi",r:"Owner Straight Driver",c:"Owner"},
  {n:"George Leonard",r:"Owner Tractor Driver",c:"Owner"},
  {n:"Jean Delsion",r:"Owner Tractor Driver",c:"Owner"},
  {n:"Jovenski Gibbs",r:"Owner Straight Driver",c:"Owner"},
  {n:"Ken Watkins",r:"Owner Straight Driver",c:"Owner"},
  {n:"Kobe Kawakabe",r:"Owner Straight Driver",c:"Owner"},
  {n:"Martin Wyatt",r:"Owner Straight Driver",c:"Owner"},
  {n:"Mone Watkins",r:"Owner Straight Driver",c:"Owner"},
  {n:"Nana Owusu",r:"Owner Straight Driver",c:"Owner"},
  {n:"Olamide Kazeem",r:"Owner Straight Driver",c:"Owner"},
  {n:"Oyieke Nelson",r:"Owner Straight Driver",c:"Owner"},
  {n:"Richard Mawuenyega",r:"Owner Straight Driver",c:"Owner"},
  {n:"Ronald Gates",r:"Owner Straight Driver",c:"Owner"},
  {n:"Samuel Osei",r:"Owner Straight Driver",c:"Owner"},
  {n:"Theo Afunyah",r:"Owner Straight Driver",c:"Owner"},
  {n:"Vincent Bonzo",r:"Owner Straight Driver",c:"Owner"}
].map(x=>({name:x.n,role:x.r,category:x.c}));

const DAYS=["Mon","Tue","Wed","Thu","Fri"];
const OFF_OPTS=["OFF","VAC","CALLED OUT","NO SHOW"];
const OOS_REASONS=["Mechanical Repair","Planned Maintenance","Tires","Body/Paint","Electrical","DOT Inspection","Accident Repair","Waiting Parts","Other"];
const C={brand:"#1e5b92",dark:"#153f66",light:"#e8f0f7",accent:"#d4841b",red:"#c0392b",green:"#27ae60",yellow:"#e6a817",purple:"#7b5ea7",cyan:"#2596be"};
const SC={available:C.green,assigned:C.brand,repair:C.yellow,oos:C.red,"for-sale":C.purple,unassigned:C.accent};
const SL={available:"Available",assigned:"Assigned",repair:"In Repair",oos:"Out of Service","for-sale":"For Sale",unassigned:"Needs Assignment"};

function gM(d){const dt=new Date(d);const dy=dt.getDay();dt.setDate(dt.getDate()-dy+(dy===0?-6:1));dt.setHours(0,0,0,0);return dt;}
function wK(d){const m=gM(d);return `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,"0")}-${String(m.getDate()).padStart(2,"0")}`;}
function fWL(d){const m=gM(d);const e=new Date(m);e.setDate(e.getDate()+4);const f=x=>`${x.getMonth()+1}/${x.getDate()}`;return `Week of ${f(m)} – ${f(e)}`;}
function dTT(r){const l=r.toLowerCase();if(l.includes("tractor"))return"tractor";if(l.includes("straight"))return"straight";if(l.includes("shuttle")||l.includes("yard"))return"tractor";return"all";}
function todayDI(){const d=new Date().getDay();return d===0||d===6?0:d-1;}
function dateStr(d){return d?new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";}

const RG=[
  {key:"ds",label:"Davis Straight Drivers",f:d=>d.category==="Davis"&&d.role.toLowerCase().includes("straight"),color:C.brand},
  {key:"dt",label:"Davis Tractor Drivers",f:d=>d.category==="Davis"&&d.role.toLowerCase().includes("tractor"),color:C.red},
  {key:"ul",label:"Uline Shuttle / Yard",f:d=>d.role.toLowerCase().includes("uline")||d.role.toLowerCase().includes("shuttle"),color:C.purple},
  {key:"ls",label:"Load/Shift Drivers",f:d=>d.role.toLowerCase().includes("load")||d.role.toLowerCase().includes("shift"),color:C.cyan},
  {key:"os",label:"Owner Op – Straight",f:d=>d.category==="Owner"&&d.role.toLowerCase().includes("straight"),color:C.accent},
  {key:"ot",label:"Owner Op – Tractor",f:d=>d.category==="Owner"&&d.role.toLowerCase().includes("tractor"),color:C.accent},
];
const BF=[{k:"all",l:"All Drivers"},{k:"box",l:"Box Truck"},{k:"tractor",l:"Tractor"},{k:"shuttle",l:"Shuttle"},{k:"load",l:"Load/Shift"},{k:"owner",l:"Owner Ops"}];

// ── MAIN APP ──
function App(){
  const[loaded,setLoaded]=useState(false);
  const[tab,setTab]=useState("dispatch");
  const[trucks,setTrucks]=useState([]);
  const[retiredTrucks,setRetiredTrucks]=useState([]);
  const[drivers,setDrivers]=useState([]);
  const[weekDate,setWeekDate]=useState(new Date());
  const[asgn,setAsgn]=useState({});
  const[tStat,setTStat]=useState({});
  const[repairs,setRepairs]=useState([]);
  const[search,setSearch]=useState("");
  const[filterType,setFilterType]=useState("all");
  const[editCell,setEditCell]=useState(null);
  const[editVal,setEditVal]=useState("");
  const[boardFilter,setBoardFilter]=useState("all");
  const[fleetView,setFleetView]=useState("list");
  const[showAddD,setShowAddD]=useState(false);
  const[showAddT,setShowAddT]=useState(false);
  const[newD,setNewD]=useState({name:"",role:"Davis Straight Driver",category:"Davis"});
  const[newT,setNewT]=useState({id:"",mk:"FRTLN",tr:"A",ax:"Single",type:"straight"});
  // Repair form
  const[showRepairForm,setShowRepairForm]=useState(null); // truckId or null
  const[repairForm,setRepairForm]=useState({reason:"Mechanical Repair",notes:"",shop:"",estReturn:"",cost:""});
  // Truck history modal
  const[historyTruck,setHistoryTruck]=useState(null);
  // Attendance weeks to load
  const[attendWeeks,setAttendWeeks]=useState({});
  // Cost tracking / Invoice scanner
  const[costEntries,setCostEntries]=useState([]);
  const[scanQueue,setScanQueue]=useState([]); // {id, file, dataUrl, status, parsed}
  const[scanning,setScanning]=useState(false);
  const[gmailResults,setGmailResults]=useState(null);
  const[gmailLoading,setGmailLoading]=useState(false);
  const[gmailConn,setGmailConn]=useState(null); // {refresh_token, email, connected_at} or null
  const[gmailProcessing,setGmailProcessing]=useState(null); // emailId currently being processed
  const[scanPreview,setScanPreview]=useState(null); // queue item currently being previewed
  const[showImportedEmails,setShowImportedEmails]=useState(false); // toggle to show already-imported emails in Gmail results
  const[dismissedMsgs,setDismissedMsgs]=useState({}); // { messageId: { subject, date, dismissedAt } } — persistent
  const[aiInsights,setAiInsights]=useState(null);
  const[aiLoading,setAiLoading]=useState(false);
  const[aiQuestion,setAiQuestion]=useState("");
  const[costFilter,setCostFilter]=useState("all"); // "all" or truck id
  const[costCatFilter,setCostCatFilter]=useState("all");
  const[showCostDetail,setShowCostDetail]=useState(null); // cost entry id
  const[showQuickFuelReport,setShowQuickFuelReport]=useState(false);
  const[driverReport,setDriverReport]=useState(null); // driver name or null
  const[attendSort,setAttendSort]=useState({col:null,dir:"desc"}); // column + direction

  const wk=wK(weekDate);

  // Load data
  useEffect(()=>{(async()=>{
    try{
      const[tR,dR,aR,sR,rR,cR,rtR]=await Promise.all([
        window.storage.get("fl-trucks").catch(()=>null),
        window.storage.get("fl-drivers").catch(()=>null),
        window.storage.get(`fl-asgn-${wk}`).catch(()=>null),
        window.storage.get(`fl-stat-${wk}`).catch(()=>null),
        window.storage.get("fl-repairs").catch(()=>null),
        window.storage.get("fl-costs").catch(()=>null),
        window.storage.get("fl-retired").catch(()=>null),
      ]);
      setTrucks(tR?JSON.parse(tR.value):[...ST,...TR]);
      setDrivers(dR?JSON.parse(dR.value):[...ID]);
      setAsgn(aR?JSON.parse(aR.value):{});
      setTStat(sR?JSON.parse(sR.value):{});
      setRepairs(rR?JSON.parse(rR.value):[]);
      setCostEntries(cR?JSON.parse(cR.value):[]);
      setRetiredTrucks(rtR?JSON.parse(rtR.value):[]);
    }catch(e){setTrucks([...ST,...TR]);setDrivers([...ID]);}
    setLoaded(true);
  })();},[wk]);

  // Load ALL attendance data from storage (supports DVIR history import)
  useEffect(()=>{if(!loaded)return;(async()=>{
    const weeks={};
    try{
      const keys=await window.storage.list('fl-asgn-');
      if(keys&&keys.keys&&keys.keys.length>0){
        for(const key of keys.keys){
          try{const r=await window.storage.get(key);if(r)weeks[key.replace('fl-asgn-','')]=JSON.parse(r.value);}catch(e){}
        }
      }else{
        for(let i=0;i<8;i++){const d=new Date(weekDate);d.setDate(d.getDate()-i*7);const k=wK(d);try{const r=await window.storage.get(`fl-asgn-${k}`);if(r)weeks[k]=JSON.parse(r.value);}catch(e){}}
      }
    }catch(e){
      for(let i=0;i<8;i++){const d=new Date(weekDate);d.setDate(d.getDate()-i*7);const k=wK(d);try{const r=await window.storage.get(`fl-asgn-${k}`);if(r)weeks[k]=JSON.parse(r.value);}catch(e2){}}
    }
    setAttendWeeks(weeks);
  })();},[loaded,wk]);

  // One-time DVIR history import — loads 68 weeks from dvir_history.json into storage
  useEffect(()=>{if(!loaded)return;(async()=>{
    try{
      const flag=await window.storage.get('fl-dvir-imported').catch(()=>null);
      if(flag)return;
      const resp=await fetch('/dvir_history.json');
      if(!resp.ok)return;
      const data=await resp.json();
      if(!Array.isArray(data))return;
      for(let i=0;i<data.length;i++){
        const w=data[i];if(!w.week)continue;
        if(w.a&&Object.keys(w.a).length>0){
          let ex={};try{const r=await window.storage.get(`fl-asgn-${w.week}`);if(r)ex=JSON.parse(r.value);}catch(e){}
          await window.storage.set(`fl-asgn-${w.week}`,JSON.stringify({...ex,...w.a}));
        }
        if(w.s&&Object.keys(w.s).length>0){
          let ex={};try{const r=await window.storage.get(`fl-stat-${w.week}`);if(r)ex=JSON.parse(r.value);}catch(e){}
          await window.storage.set(`fl-stat-${w.week}`,JSON.stringify({...ex,...w.s}));
        }
      }
      await window.storage.set('fl-dvir-imported',JSON.stringify({date:new Date().toISOString(),weeks:data.length}));
      console.log(`DVIR history imported: ${data.length} weeks`);
    }catch(e){console.log('DVIR import skipped:',e.message);}
  })();},[loaded]);

  const sv=useCallback(async(k,v)=>{try{await window.storage.set(k,JSON.stringify(v));}catch(e){}},[]);
  const saveTrucks=t=>{setTrucks(t);sv("fl-trucks",t);};
  const saveRetiredTrucks=rt=>{setRetiredTrucks(rt);sv("fl-retired",rt);};
  const saveDrivers=d=>{setDrivers(d);sv("fl-drivers",d);};
  const saveAsgn=useCallback(a=>{setAsgn(a);sv(`fl-asgn-${wk}`,a);},[wk,sv]);
  const saveTStat=useCallback(s=>{setTStat(s);sv(`fl-stat-${wk}`,s);},[wk,sv]);
  const saveRepairs=useCallback(r=>{setRepairs(r);sv("fl-repairs",r);},[sv]);
  const saveCosts=useCallback(c=>{setCostEntries(c);sv("fl-costs",c);},[sv]);

  // ── FuelFox: redistribute Invoice overhead (tax+fee) into Service Log truck entries ──
  // Matches by date: Invoice dated 04/16/2026 → Service Log entries with date 2026-04-16
  // Each truck gets bumped by (truck_gallons / total_gallons) × overhead_amount
  // The Invoice entry is consumed (deleted) after redistribution.
  const redistributeFuelFoxOverhead=()=>{
    const list=[...costEntries];
    // Find all FuelFox invoice overhead rows (truckId===INVENTORY, invoiceNum matches DD###)
    const overheadRows=list.filter(c=>
      c.vendor==="FuelFox Atlanta"&&
      c.truckId==="INVENTORY"&&
      c.invoiceNum&&/^DD\d+$/.test(c.invoiceNum)&&
      !c.redistributed
    );
    if(overheadRows.length===0){alert("No FuelFox Invoice overhead rows found to redistribute. Make sure you've imported both the Service Log AND Invoice PDFs.");return;}

    let redistributedCount=0;
    let unmatchedCount=0;
    const report=[];

    overheadRows.forEach(overhead=>{
      const date=overhead.date;
      // Find Service Log entries from the same date
      const serviceEntries=list.filter(c=>
        c.vendor==="FuelFox Atlanta"&&
        c.truckId!=="INVENTORY"&&
        c.date===date&&
        c.gallons&&c.gallons>0&&
        c.invoiceNum&&c.invoiceNum.startsWith("FUELFOX-SL-")&&
        !c.fuelfoxOverheadApplied
      );

      if(serviceEntries.length===0){
        unmatchedCount++;
        report.push(`❌ ${overhead.invoiceNum} ($${overhead.total.toFixed(2)}): no matching Service Log entries for ${date}`);
        return;
      }

      const totalGallons=serviceEntries.reduce((sum,e)=>sum+Number(e.gallons),0);
      const overheadAmount=Number(overhead.total);
      const overheadPerGal=overheadAmount/totalGallons;

      // Bump each truck's cost by its share of overhead
      serviceEntries.forEach(entry=>{
        const share=Number(entry.gallons)*overheadPerGal;
        const newTotal=Number(entry.total)+share;
        const newPricePerGal=newTotal/Number(entry.gallons);
        const idx=list.findIndex(c=>c.id===entry.id);
        if(idx>=0){
          list[idx]={
            ...list[idx],
            total:Math.round(newTotal*100)/100,
            pricePerGallon:Math.round(newPricePerGal*10000)/10000,
            fuelfoxOverheadApplied:overhead.invoiceNum,
            notes:(list[idx].notes||"")+` [+$${share.toFixed(2)} overhead from ${overhead.invoiceNum}]`,
          };
        }
      });

      // Mark overhead row as redistributed so we can delete it
      const ohIdx=list.findIndex(c=>c.id===overhead.id);
      if(ohIdx>=0){list[ohIdx]={...list[ohIdx],redistributed:true};}
      redistributedCount++;
      report.push(`✅ ${overhead.invoiceNum} ($${overheadAmount.toFixed(2)}): distributed across ${serviceEntries.length} trucks (${totalGallons.toFixed(1)} gal, $${overheadPerGal.toFixed(4)}/gal overhead)`);
    });

    // Remove redistributed overhead rows
    const cleaned=list.filter(c=>!c.redistributed);
    saveCosts(cleaned);
    alert(`FuelFox overhead redistribution:\n\n${report.join("\n")}\n\n${redistributedCount} distributed, ${unmatchedCount} unmatched.`);
  };

  // ── Invoice Scanner AI ──
  const COST_CATS=["Parts","Tires","Labor","Fuel","Oil","Body/Paint","Electrical","Inspection","Towing","Registration","Insurance","Inventory","Other"];

  // Normalize vendor names so "Peach State Freightliner" and "Peach State Freightliner, LLC" become the same
  const normalizeVendor=(name)=>{
    if(!name)return"Unknown";
    let n=String(name).trim();
    // Remove common suffixes
    n=n.replace(/,?\s*(LLC|L\.L\.C\.|Inc\.?|Incorporated|Corp\.?|Corporation|Co\.?|Company|Ltd\.?|Limited)\.?$/i,"");
    n=n.replace(/\s+/g," ").trim();
    return n||"Unknown";
  };

  // Truck type icon for drivers
  const ForkLift=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline",verticalAlign:"middle",marginRight:2}}><path d="M3 17h4V7H3zM7 12h4l2-5h4v10h-6"/><circle cx="5" cy="19" r="2"/><circle cx="15" cy="19" r="2"/><path d="M20 7v10h2V7z"/></svg>;
  const drvIcon=(role)=>{
    if(!role)return"";
    const r=role.toLowerCase();
    if(r.includes("tractor"))return"🚛 ";
    if(r.includes("straight"))return"🚚 ";
    if(r.includes("shuttle")||r.includes("yard"))return"🚀 ";
    if(r.includes("load")||r.includes("shift"))return <ForkLift/>;
    return"🚛 ";
  };
  const DEFAULT_VENDORS=[
    {pattern:"fuelfox",name:"FuelFox Atlanta",category:"Fuel"},
    {pattern:"peachstate",name:"Peach State Freightliner",category:"Parts"},
    {pattern:"quickfuel",name:"Quick Fuel",category:"Fuel"},
  ];
  const[knownVendors,setKnownVendors]=useState(DEFAULT_VENDORS);
  const[showAddVendor,setShowAddVendor]=useState(false);
  const[newVendor,setNewVendor]=useState({name:"",category:"Parts"});

  // Load vendors from storage
  useEffect(()=>{(async()=>{
    try{const r=await window.storage.get("fl-vendors");if(r)setKnownVendors(JSON.parse(r.value));}catch(e){}
  })();},[]);
  const saveVendors=useCallback(v=>{setKnownVendors(v);sv("fl-vendors",v);},[sv]);
  const removeVendor=(name)=>saveVendors(knownVendors.filter(v=>v.name!==name));
  const addVendor=()=>{if(!newVendor.name.trim())return;saveVendors([...knownVendors,{pattern:newVendor.name.toLowerCase().replace(/\s+/g,""),name:newVendor.name,category:newVendor.category}]);setNewVendor({name:"",category:"Parts"});setShowAddVendor(false);};

  // Gmail invoice fetch
  // ── AI Fleet Advisor ──
  const runAiAnalysis=async(customQ)=>{
    setAiLoading(true);
    setAiInsights(null);
    try{
      // Gather all fleet data for analysis
      const costSummary=costEntries.slice(0,500).map(c=>({date:c.date,truck:c.truckId,vendor:c.vendor,amount:c.total,category:c.category,inv:c.invoiceNum}));
      const repairSummary=repairs.map(r=>({truck:r.truckId,reason:r.reason,status:r.status,dateIn:r.dateIn,dateClosed:r.dateClosed,cost:r.cost,shop:r.shop}));
      // Current week assignments
      const asgnSummary={};
      drivers.forEach(d=>{const trucks=[];DAYS.forEach(day=>{const v=asgn[`${d.name}-${day}`]||"";if(v&&!["OFF","VAC","CO","NS"].includes(v))trucks.push(v);});if(trucks.length)asgnSummary[d.name]={role:d.role,trucks};});
      // Attendance from last 8 weeks
      const attSummary={};
      Object.entries(attendWeeks).forEach(([wk,wkAsgn])=>{
        drivers.forEach(d=>{
          if(!attSummary[d.name])attSummary[d.name]={worked:0,off:0,calledOut:0,noShow:0,vac:0};
          DAYS.forEach(day=>{
            const v=wkAsgn[`${d.name}-${day}`]||"";
            if(v==="CO")attSummary[d.name].calledOut++;
            else if(v==="NS")attSummary[d.name].noShow++;
            else if(v==="OFF")attSummary[d.name].off++;
            else if(v==="VAC")attSummary[d.name].vac++;
            else if(v)attSummary[d.name].worked++;
          });
        });
      });
      // Top cost trucks
      const truckCosts={};
      costEntries.forEach(c=>{if(!truckCosts[c.truckId])truckCosts[c.truckId]={total:0,count:0};truckCosts[c.truckId].total+=(c.total||0);truckCosts[c.truckId].count++;});
      const topCostTrucks=Object.entries(truckCosts).sort((a,b)=>b[1].total-a[1].total).slice(0,15).map(([id,d])=>({truck:id,total:Math.round(d.total),invoices:d.count}));

      const fleetData=JSON.stringify({
        fleetSize:trucks.length,
        truckTypes:{straight:trucks.filter(t=>t.type==="straight").length,tractor:trucks.filter(t=>t.type==="tractor").length},
        driverCount:drivers.length,
        totalCostEntries:costEntries.length,
        totalSpend:Math.round(costEntries.reduce((s,c)=>s+(c.total||0),0)),
        topCostTrucks,
        currentAssignments:asgnSummary,
        attendance:attSummary,
        repairs:repairSummary,
        recentCosts:costSummary.slice(0,100),
      });

      const question=customQ||"Analyze my fleet data and give me your top findings. Focus on: 1) Driver reliability issues (attendance patterns, call-outs, no-shows) 2) High-cost trucks that may need attention or retirement 3) Maintenance patterns or red flags 4) Any unusual spending patterns 5) Operational recommendations. Be specific — use actual truck numbers, driver names, and dollar amounts.";

      const resp=await fetch("/api/scan-invoice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        messages:[{role:"user",content:[
          {type:"text",text:`You are the AI Fleet Operations Advisor for Davis Delivery Service, a family-owned LTL final mile freight carrier based in Buford, GA with 50+ trucks (box trucks and tractor trailers). You analyze fleet data to find patterns, flag problems, and make recommendations.

Here is the current fleet data:
${fleetData}

${question}

Format your response as clear sections with headers using ** for bold. Use specific numbers, names, and amounts. Be direct and actionable — this is for the owner who makes operational decisions daily. Keep it concise but thorough.`}
        ]}]
      })});

      const data=await resp.json();
      const text=data.content?.find(c=>c.type==="text")?.text||"";
      if(text){
        setAiInsights(text);
      }else{
        setAiInsights("Could not generate insights. Raw response: "+JSON.stringify(data).substring(0,300));
      }
    }catch(err){
      setAiInsights("Error: "+(err.message||"Failed to analyze fleet data"));
    }
    setAiLoading(false);
  };

  // Load Gmail connection state + dismissed message IDs
  useEffect(()=>{if(!loaded)return;(async()=>{
    try{
      const r=await window.storage.get("fl-gmail-token").catch(()=>null);
      if(r)setGmailConn(JSON.parse(r.value));
    }catch(e){}
    try{
      const d=await window.storage.get("fl-gmail-dismissed").catch(()=>null);
      if(d)setDismissedMsgs(JSON.parse(d.value)||{});
    }catch(e){}
  })();},[loaded]);

  // Persistently dismiss an email — it won't show up in future Gmail searches
  const dismissGmailMsg=useCallback((msgId,meta)=>{
    setDismissedMsgs(prev=>{
      const next={...prev,[msgId]:{subject:meta?.subject||"",date:meta?.date||"",dismissedAt:new Date().toISOString()}};
      window.storage.set("fl-gmail-dismissed",JSON.stringify(next)).catch(()=>{});
      return next;
    });
  },[]);

  const clearAllDismissed=useCallback(()=>{
    if(!confirm("Clear the dismissed-email list? Previously dismissed emails will reappear in future searches."))return;
    setDismissedMsgs({});
    window.storage.delete("fl-gmail-dismissed").catch(()=>{});
  },[]);

  const disconnectGmail=async()=>{
    if(!confirm("Disconnect Gmail? You'll need to re-authorize to fetch invoices again."))return;
    try{await window.storage.delete("fl-gmail-token");}catch(e){}
    setGmailConn(null);
    setGmailResults(null);
  };

  const fetchGmailInvoices=async(vendor)=>{
    if(!gmailConn||!gmailConn.refresh_token){
      setGmailResults([{error:"Gmail not connected. Click Connect Gmail first."}]);
      return;
    }
    setGmailLoading(true);
    setGmailResults(null);
    try{
      const d=new Date();d.setDate(d.getDate()-365);
      const afterDate=`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
      const resp=await fetch("/api/gmail-search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:gmailConn.refresh_token,vendor:vendor||"peach state",afterDate})});
      const data=await resp.json();
      if(data.error){setGmailResults([{error:String(data.error).substring(0,300)}]);}
      else if(Array.isArray(data.results)){
        if(data.results.length===0)setGmailResults([{error:"No matching emails found in the last year."}]);
        else setGmailResults(data.results);
      }else{
        setGmailResults([{error:"Unexpected response: "+JSON.stringify(data).substring(0,200)}]);
      }
    }catch(err){
      setGmailResults([{error:(err&&err.message)||"Failed to fetch from Gmail"}]);
    }
    setGmailLoading(false);
  };

  // Pull a PDF attachment from Gmail and send through the invoice scanner pipeline
  const processGmailAttachment=async(emailResult,att)=>{
    if(!gmailConn||!gmailConn.refresh_token)return;
    // Check for duplicate — already in cost entries?
    const gmailTag=`gmail:${emailResult.emailId}:${att.attachmentId}`;
    if(costEntries.some(c=>c.gmailRef===gmailTag)){
      alert("This attachment has already been saved.");
      return;
    }
    // Check for duplicate — already in current scan queue?
    if(scanQueue.some(q=>q.gmailRef===gmailTag)){
      alert("This attachment is already in your scan queue.");
      return;
    }
    setGmailProcessing(emailResult.emailId);
    try{
      // Fetch the attachment bytes — retry once on network failure, with 30s timeout
      let data;
      let attempt=0;
      while(attempt<2){
        try{
          const ctrl=new AbortController();
          const timer=setTimeout(()=>ctrl.abort(),30000);
          let resp;
          try{
            resp=await fetch("/api/gmail-attachment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:gmailConn.refresh_token,messageId:emailResult.emailId,attachmentId:att.attachmentId}),signal:ctrl.signal});
          }finally{clearTimeout(timer);}
          if(!resp.ok){
            const errText=await resp.text();
            // Netlify returns 502 when function response exceeds 6MB
            if(resp.status===502||resp.status===413){
              throw new Error(`Attachment too large (${Math.round((att.size||0)/1024/1024*10)/10}MB) — Netlify's 6MB function limit. Try downloading from Gmail manually and uploading via "Choose Files".`);
            }
            throw new Error(`Gmail download failed (HTTP ${resp.status}): ${errText.substring(0,200)}`);
          }
          data=await resp.json();
          if(data.error)throw new Error(data.error);
          break; // success
        }catch(fetchErr){
          // AbortError means the 30s timeout fired — don't retry, just fail clearly
          if(fetchErr.name==="AbortError")throw new Error(`Gmail download timed out after 30s on "${att.filename}". Attachment may be too large or Gmail is slow. Try again or download manually.`);
          attempt++;
          if(attempt>=2){
            // "Load failed" is Safari's generic fetch-failure message — make it actionable
            if((fetchErr.message||"").toLowerCase().includes("load failed")){
              throw new Error(`Network request failed on "${att.filename}" (likely timeout or size). Try again in a moment, or download the PDF from Gmail manually and use "Choose Files".`);
            }
            throw fetchErr;
          }
          await new Promise(r=>setTimeout(r,1000)); // wait 1s then retry
        }
      }
      const b64Raw=data.data;
      if(!b64Raw||b64Raw.length===0)throw new Error("Gmail returned empty attachment data");

      // v2.9.4: If base64 fails to decode, refetch once with a 3s delay.
      // Gmail's attachment API occasionally returns truncated/corrupted base64
      // on large binary PDFs, especially the first fetch after token refresh.
      const validateB64=(s)=>{
        try{
          let c=s.replace(/-/g,"+").replace(/_/g,"/").replace(/[^A-Za-z0-9+/]/g,"");
          c=c+"=".repeat((4-(c.length%4))%4);
          atob(c);
          return true;
        }catch{return false;}
      };
      const isPdfByName=att.filename.toLowerCase().endsWith(".pdf")||att.mimeType==="application/pdf";
      if(isPdfByName&&!validateB64(b64Raw)){
        console.log(`[gmail] Base64 validation failed on first fetch — refetching "${att.filename}" in 3s`);
        await new Promise(r=>setTimeout(r,3000));
        try{
          const resp2=await fetch("/api/gmail-attachment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:gmailConn.refresh_token,messageId:emailResult.emailId,attachmentId:att.attachmentId})});
          if(resp2.ok){
            const data2=await resp2.json();
            if(data2.data&&validateB64(data2.data)){
              console.log(`[gmail] Refetch succeeded — using clean base64`);
              data.data=data2.data;
            }
          }
        }catch(e){console.log("[gmail] Refetch failed:",e.message);}
      }

      const b64Final=data.data;
      const isPdf=att.filename.toLowerCase().endsWith(".pdf")||att.mimeType==="application/pdf";
      const newItems=[];
      if(isPdf){
        // v2.9.2: extract PDF text (not bytes) — saves ~90% tokens
        let b64Clean=b64Final.replace(/-/g,"+").replace(/_/g,"/").replace(/[^A-Za-z0-9+/]/g,"");
        const padLen=(4-(b64Clean.length%4))%4;
        b64Clean=b64Clean+"=".repeat(padLen);
        // v2.9.4: validate the FULL base64 string, not just the first 100 chars.
        // Corruption anywhere in the stream (e.g., mid-PDF font tables) breaks atob().
        try{atob(b64Clean);}catch(decodeErr){
          const first=b64Clean.substring(0,20);
          throw new Error(`Base64 decode failed on "${att.filename}" (length ${b64Clean.length}, starts "${first}"). The attachment is not cleanly base64-encoded — likely a transient Gmail API glitch or an image-only PDF. Try: (1) re-queueing this one attachment, or (2) download from Gmail manually and upload via "Choose Files".`);
        }
        if(!window.pdfjsLib){
          try{
            await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
            window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          }catch(e){}
        }
        let pdfText="";let pageCount=1;
        try{
          const binary=atob(b64Clean);
          const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
          const pdf=await window.pdfjsLib.getDocument({data:bytes}).promise;
          pageCount=pdf.numPages;
          const pages=[];
          for(let p=1;p<=pdf.numPages;p++){
            const page=await pdf.getPage(p);
            const tc=await page.getTextContent();
            const byLine={};
            tc.items.forEach(item=>{
              const y=Math.round(item.transform[5]);
              if(!byLine[y])byLine[y]=[];
              byLine[y].push({x:item.transform[4],str:item.str});
            });
            const sortedY=Object.keys(byLine).sort((a,b)=>Number(b)-Number(a));
            const lines=sortedY.map(y=>byLine[y].sort((a,b)=>a.x-b.x).map(i=>i.str).join(" ").trim()).filter(l=>l);
            pages.push(`--- PAGE ${p} of ${pdf.numPages} ---\n${lines.join("\n")}`);
          }
          pdfText=pages.join("\n\n");
        }catch(e){console.log("Gmail PDF text extraction failed:",e.message);}
        const origDataUrl=`data:application/pdf;base64,${b64Clean}`;
        newItems.push({
          id:Date.now()+Math.random(),
          file:`${att.filename} (${pageCount}pg)`,
          dataUrl:origDataUrl,
          pdfText,
          status:"ready",parsed:null,type:"pdf-doc",
          origFileName:att.filename,origMimeType:"application/pdf",origDataUrl,
          gmailRef:gmailTag,
        });
      }else if(att.mimeType&&att.mimeType.startsWith("image/")){
        const dataUrl=`data:${att.mimeType};base64,${b64Final}`;
        newItems.push({id:Date.now()+Math.random(),file:att.filename,dataUrl,status:"ready",parsed:null,type:"image",origFileName:att.filename,origMimeType:att.mimeType,origDataUrl:dataUrl,gmailRef:gmailTag});
      }
      if(newItems.length>0){
        setScanQueue(prev=>[...prev,...newItems]);
      }
    }catch(err){
      alert("Failed to process attachment: "+(err.message||"Unknown error"));
    }
    setGmailProcessing(null);
  };

  const handleFileUpload=async(e)=>{
    const files=Array.from(e.target.files);
    const queue=[];
    for(const file of files){
      if(file.type==="application/pdf"){
        // v2.9.2: extract TEXT from PDF client-side
        const pdfBytes=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file);});
        if(!window.pdfjsLib){
          try{
            await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
            window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          }catch(e){}
        }
        let pdfText="";let pageCount=1;
        try{
          const arrayBuf=await file.arrayBuffer();
          const pdf=await window.pdfjsLib.getDocument({data:arrayBuf}).promise;
          pageCount=pdf.numPages;
          const pages=[];
          for(let p=1;p<=pdf.numPages;p++){
            const page=await pdf.getPage(p);
            const tc=await page.getTextContent();
            const byLine={};
            tc.items.forEach(item=>{
              const y=Math.round(item.transform[5]);
              if(!byLine[y])byLine[y]=[];
              byLine[y].push({x:item.transform[4],str:item.str});
            });
            const sortedY=Object.keys(byLine).sort((a,b)=>Number(b)-Number(a));
            const lines=sortedY.map(y=>byLine[y].sort((a,b)=>a.x-b.x).map(i=>i.str).join(" ").trim()).filter(l=>l);
            pages.push(`--- PAGE ${p} of ${pdf.numPages} ---\n${lines.join("\n")}`);
          }
          pdfText=pages.join("\n\n");
        }catch(e){console.log("PDF text extraction failed:",e.message);}
        queue.push({
          id:Date.now()+Math.random(),
          file:`${file.name} (${pageCount}pg)`,
          dataUrl:pdfBytes,
          pdfText,
          status:"ready",parsed:null,type:"pdf-doc",
          origFileName:file.name,origMimeType:"application/pdf",origDataUrl:pdfBytes,
        });
      }else if(file.type.startsWith("image/")){
        const dataUrl=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file);});
        queue.push({id:Date.now()+Math.random(),file:file.name,dataUrl,status:"ready",parsed:null,type:"image",origFileName:file.name,origMimeType:file.type,origDataUrl:dataUrl});
      }
    }
    setScanQueue(prev=>[...prev,...queue]);
  };

  const scanInvoices=async()=>{
    if(scanQueue.filter(q=>q.status==="ready").length===0)return;
    setScanning(true);
    const truckIds=trucks.map(t=>t.id).join(", ");
    const updated=[...scanQueue];

    // ── Process every queued item individually (same path for ALL vendors) ──
    for(let i=0;i<updated.length;i++){
      if(updated[i].status!=="ready")continue;
      updated[i].status="scanning";
      setScanQueue([...updated]);

      // v2.9.3: auto-retry up to 3 attempts on recoverable errors
      const MAX_SCAN_ATTEMPTS=3;
      const UNFIXABLE_ERROR_PATTERNS=[
        /base64 decode failed/i,
        /string did not match/i,   // v2.9.4: atob() failure on corrupted base64
        /expected pattern/i,        // v2.9.4: atob() alternate phrasing
        /unsupported format/i,
        /corrupted/i,
        /blank or near-blank/i,
        /file may be corrupted/i,
        /too large/i,
      ];
      let scanAttempt=0;
      let scanSucceeded=false;
      while(scanAttempt<MAX_SCAN_ATTEMPTS&&!scanSucceeded){
        scanAttempt++;
        if(scanAttempt>1){
          const waitMs=5000*Math.pow(2,scanAttempt-2);
          updated[i].status="waiting";
          updated[i].parsed={_waitMsg:`Error — retrying in ${waitMs/1000}s (attempt ${scanAttempt}/${MAX_SCAN_ATTEMPTS})`};
          setScanQueue([...updated]);
          await new Promise(r=>setTimeout(r,waitMs));
          updated[i].status="scanning";
          updated[i].parsed=null;
          setScanQueue([...updated]);
        }

      try{
        const isPdfText=updated[i].type==="pdf-doc"&&updated[i].pdfText;
        const MAX_B64_CHARS=5_300_000;
        let contentBlock;
        let base64Data=null;
        let mediaType=null;

        if(isPdfText){
          // v2.9.2: send extracted PDF TEXT instead of raw bytes
          contentBlock=null;
        }else{
          // Image path (legacy items, photos, direct image uploads)
          mediaType=updated[i].dataUrl.split(";")[0].split(":")[1];
          base64Data=updated[i].dataUrl.split(",")[1];

          // ─── PRE-FLIGHT: detect blank/near-blank images ───
          let blankReason=null;
          if(mediaType&&mediaType.startsWith("image/")){
            try{
              const probeImg=new Image();
              await new Promise((res,rej)=>{probeImg.onload=res;probeImg.onerror=rej;probeImg.src=updated[i].dataUrl;});
              if(probeImg.width<50||probeImg.height<50){
                blankReason=`image too small (${probeImg.width}×${probeImg.height}px)`;
              }else{
                const probeCv=document.createElement("canvas");
                probeCv.width=200;probeCv.height=200;
                probeCv.getContext("2d").drawImage(probeImg,0,0,200,200);
                const pixels=probeCv.getContext("2d").getImageData(0,0,200,200).data;
                let nonWhite=0;let sampled=0;
                for(let p=0;p<pixels.length;p+=16){
                  if(pixels[p]<230||pixels[p+1]<230||pixels[p+2]<230)nonWhite++;
                  sampled++;
                }
                const contentRatio=nonWhite/sampled;
                if(contentRatio<0.01)blankReason=`image is ${(contentRatio*100).toFixed(2)}% content (appears blank)`;
              }
            }catch(probeErr){/* if probe fails, continue */}
          }
          if(blankReason){
            updated[i].status="error";
            updated[i].parsed={error:`Skipped — ${blankReason}. No invoice data.`};
            setScanQueue([...updated]);
            continue;
          }

          // Downsize if too large
          if(base64Data&&base64Data.length>MAX_B64_CHARS&&mediaType&&mediaType.startsWith("image/")){
            try{
              const img=new Image();
              await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=updated[i].dataUrl;});
              const tryQualities=[0.7,0.55,0.4,0.3];
              const tryScales=[1,0.75,0.55];
              let best=null;
              outer:for(const sc of tryScales){
                const cv=document.createElement("canvas");
                cv.width=Math.round(img.width*sc);
                cv.height=Math.round(img.height*sc);
                cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
                for(const q of tryQualities){
                  const du=cv.toDataURL("image/jpeg",q);
                  const b=du.split(",")[1];
                  if(b.length<=MAX_B64_CHARS){best=b;break outer;}
                }
              }
              if(best){base64Data=best;}
            }catch(recErr){/* fall through */}
          }
          contentBlock={type:"image",source:{type:"base64",media_type:mediaType,data:base64Data}};
        }

        // Build prompt — for PDF text mode, inject the extracted text directly.
        const promptIntro=isPdfText
          ? `You are parsing a vendor invoice for Davis Delivery Service, a trucking company. Below is the EXTRACTED TEXT of the invoice PDF.

=============== INVOICE TEXT ===============
${updated[i].pdfText}
=============== END INVOICE TEXT ===============

This document may contain MULTIPLE invoices (e.g., Quick Fuel lists many trucks, each treated as a separate invoice). Extract EVERY invoice/truck-row found and return a JSON ARRAY of objects (no markdown, no backticks, no explanation). Even if there is only one invoice, return it inside an array.`
          : `You are parsing vendor invoices for Davis Delivery Service, a trucking company. This document may contain MULTIPLE invoices. Extract EVERY invoice found and return a JSON ARRAY of objects (no markdown, no backticks, no explanation). Even if there is only one invoice, return it inside an array.`;

        const msgBody={messages:[{role:"user",content:[
              ...(contentBlock?[contentBlock]:[]),
              {type:"text",text:`${promptIntro}

Each invoice object should have:
{
  "truckId": "3-5 digit truck/unit number, or 'INVENTORY' if no specific truck",
  "vendor": "vendor/shop name",
  "date": "YYYY-MM-DD",
  "invoiceNum": "invoice number or null",
  "total": number (the TOTAL amount including tax),
  "category": "one of: ${COST_CATS.join(", ")}",
  "lineItems": [{"desc": "description", "amount": number}],
  "notes": "brief summary of work/parts"
}

CRITICAL RULES FOR FINDING THE TRUCK NUMBER:
- For Peach State Freightliner invoices: The truck number is the LAST 4 DIGITS of the PO# field. Examples: PO# "JK0294" = truck "0294", PO# "FH3889" = truck "3889", PO# "FG2617" = truck "2617", PO# "0920" = truck "0920".
- If PO# is "INVENTORY" or blank or there is no truck indicated, set truckId to "INVENTORY".
- For other vendors: look for Unit #, Truck #, Vehicle #, or any 4-digit reference matching the fleet.
- If you truly cannot determine a truck, use "INVENTORY" (NOT null, NOT "UNKNOWN").

SPECIAL RULE FOR QUICK FUEL / FLYERS ENERGY INVOICES (from "ebilling@4flyers.com" or containing "Flyers Energy"):
- These are weekly fuel card invoices from "Flyers Energy, LLC" (vendor should be "Quick Fuel"). Invoice # format: "CFS-XXXXXXX".
- Find the section in the text that starts with "Recap by Additional Info 2" — this is your CRITICAL data source. This section lists per-truck totals and ends just before the next section called "Recap by Card" (which you must IGNORE).
- In the "Recap by Additional Info 2" section, each line has: [Truck#] [Units/gallons] [Amount pre-tax] [Taxes] [Total with tax]
    - Truck numbers can be 3, 4, or 5 digits (e.g., "294", "878", "1478", "70333", "93604"). Preserve as-is.
    - A row with truck "0" or "0 Total" means the fuel was UNASSIGNED (driver forgot to enter unit #) — use truckId "INVENTORY".
- EVERY row in that Recap table becomes ONE object in your output array. If the table has 11 rows, you return 11 objects. If it has 30 rows, you return 30 objects. DO NOT merge, summarize, or skip rows.
- For each row:
    - truckId: the truck # (or "INVENTORY" for the "0" bucket)
    - vendor: "Quick Fuel"
    - category: "Fuel"
    - total: the "Total" column value (with tax) — REQUIRED
    - gallons: the "Units" column value — REQUIRED, even for INVENTORY bucket
    - pricePerGallon: total / gallons rounded to 4 decimals — REQUIRED
    - invoiceNum: MUST be unique per row — format "<base invoice #>-<truckId>". Examples: "CFS-4582698-0294", "CFS-4582698-UNASSIGNED", "CFS-4582698-70333".
    - date: the Invoice Date from the top of the invoice (YYYY-MM-DD)
    - lineItems: [{"desc": "X.XX gallons @ $Y.YYYY/gal (true cost incl tax)", "amount": total}]
    - notes: "Weekly fuel card - Truck X" (or for INVENTORY: "Unassigned fuel - Driver forgot to enter unit #")
- FINAL SANITY CHECK before returning: sum all row totals. The sum must equal the "Invoice Amount" shown at the top of the invoice within $5. If your sum is lower, you missed rows — scan the Recap table again.

SPECIAL RULE FOR FUELFOX ATLANTA (from "accounting@fuelfox.net"):
- FuelFox sends TWO SEPARATE PDFs for each delivery, handled differently:

  (A) SERVICE LOG — filename contains "ServiceLog". Header shows "Service Log", "Customer:", "Service Date:", "Ambassador:", "Service Vehicle:", "FoxSpot:". Usually 2 pages (first page trucks 0424-4952, second page trucks 5042-7773 + Total).
    - Under "Diesel" heading there's a table with columns: [Unit Number] [Gallons] [Price Per Gallon] [Total Charge]. Last row shows "Total: X,XXX.X Total: $X,XXX.XX".
    - Return ONE OBJECT PER TRUCK row (NOT the Total row), with:
       - truckId: Unit Number (e.g., "0424", "1478", "3889")
       - vendor: "FuelFox Atlanta"
       - category: "Fuel"
       - total: Total Charge column (this is base price × gallons, no tax/delivery yet)
       - gallons: Gallons column
       - pricePerGallon: Price Per Gallon column (base price)
       - date: Service Date from header (YYYY-MM-DD)
       - invoiceNum: "FUELFOX-SL-YYYY-MM-DD-<truckId>" using the service date. E.g., "FUELFOX-SL-2026-04-16-0424".
       - lineItems: [{"desc": "X.X gallons diesel @ $Y.YYYY/gal (base)", "amount": total}]
       - notes: "FuelFox Service Log - Truck <truckId> (base price, tax+fee added later)"
    - SANITY: sum of row totals must equal the "Total: $X,XXX.XX" shown at bottom.

  (B) INVOICE — filename contains "Invoice_DD". Header shows "FuelFox Atlanta", "INVOICE", "INVOICE DDxxx", "DATE", "DUE DATE". Single page. Has rows for "Diesel Sales", "Diesel Taxes", "Delivery Fee", and "BALANCE DUE".
    - Return EXACTLY ONE object (not per-truck):
       - truckId: "INVENTORY"
       - vendor: "FuelFox Atlanta"
       - category: "Fuel"
       - total: Diesel Taxes amount + Delivery Fee amount (e.g., 343.08 + 150.00 = 493.08). NOT the Balance Due — that includes Diesel Sales which will already be captured from the Service Log.
       - invoiceNum: the invoice # (e.g., "DD404")
       - date: the invoice DATE (YYYY-MM-DD)
       - lineItems: [{"desc": "Diesel Taxes", "amount": tax}, {"desc": "Delivery Fee", "amount": fee}]
       - notes: "FuelFox Invoice DDxxx overhead (tax+delivery). Distribute across Service Log trucks via Redistribute Overhead button."

Known truck numbers in this fleet: ${truckIds}

Always match to the closest fleet number. Use the TOTAL line (including tax) for the total amount. For the date, use DATE INVOICE (not DATE SHIPPED). Return ONLY the JSON array.`}
            ]}]};

        let resp=await fetch("/api/scan-invoice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(msgBody)});
        let data=await resp.json();

        // v2.9.2: rate-limit retry with exponential backoff
        let rateRetryAttempt=0;
        while(data.error&&/rate.?limit|429/i.test(String(data.error)+String(data.details||""))&&rateRetryAttempt<3){
          rateRetryAttempt++;
          const waitMs=5000*Math.pow(2,rateRetryAttempt-1);
          updated[i].status="waiting";
          updated[i].parsed={_waitMsg:`Rate limit hit — waiting ${waitMs/1000}s before retry ${rateRetryAttempt}/3`};
          setScanQueue([...updated]);
          await new Promise(r=>setTimeout(r,waitMs));
          updated[i].status="scanning";
          updated[i].parsed=null;
          setScanQueue([...updated]);
          resp=await fetch("/api/scan-invoice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(msgBody)});
          data=await resp.json();
        }

        // If Anthropic rejected the JPEG base64 with "did not match", retry ONCE with PNG.
        // Their validator sometimes chokes on JPEG's chroma subsampling artifacts on
        // sparse content pages — PNG is lossless and tends to succeed where JPEG fails.
        if(data.error&&/string did not match/i.test(data.error+(data.details||""))&&mediaType&&mediaType.startsWith("image/")){
          try{
            const rImg=new Image();
            await new Promise((res,rej)=>{rImg.onload=res;rImg.onerror=rej;rImg.src=updated[i].dataUrl;});
            const rCv=document.createElement("canvas");
            // Downsize to 1200px max for PNG retry to keep it under Anthropic's limit
            const rScale=Math.min(1,1200/Math.max(rImg.width,rImg.height));
            rCv.width=Math.round(rImg.width*rScale);
            rCv.height=Math.round(rImg.height*rScale);
            // White background so transparency doesn't confuse the validator
            const rCtx=rCv.getContext("2d");
            rCtx.fillStyle="#ffffff";
            rCtx.fillRect(0,0,rCv.width,rCv.height);
            rCtx.drawImage(rImg,0,0,rCv.width,rCv.height);
            const pngB64=rCv.toDataURL("image/png").split(",")[1];
            if(pngB64&&pngB64.length<=MAX_B64_CHARS){
              const retryBody={...msgBody,messages:[{...msgBody.messages[0],content:[
                {type:"image",source:{type:"base64",media_type:"image/png",data:pngB64}},
                msgBody.messages[0].content[1],
              ]}]};
              resp=await fetch("/api/scan-invoice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(retryBody)});
              data=await resp.json();
            }
          }catch(retryErr){/* fall through to error handler below */}
        }

        if(data.error){
          // If Anthropic rejected the base64 image, surface that clearly with image size
          const fullErr=data.error+(data.details?": "+data.details.substring(0,400):"");
          if(/string did not match|could not (process|decode)|invalid.*base64|image too large/i.test(fullErr)){
            const imgKB=Math.round((base64Data?.length||0)*0.75/1024);
            throw new Error(`Image rejected by Claude API (${imgKB}KB) even after PNG retry. Page may be sparse/blank. ${fullErr.substring(0,200)}`);
          }
          throw new Error(fullErr);
        }
        const text=data.content?.find(c=>c.type==="text")?.text||"";
        if(!text)throw new Error("AI returned empty response (may have hit token limit)");
        const clean=text.replace(/```json|```/g,"").trim();
        const arrayMatch=clean.match(/\[[\s\S]*\]/);
        const jsonStr=arrayMatch?arrayMatch[0]:clean;
        let parsed;
        try{parsed=JSON.parse(jsonStr);}catch(e){throw new Error("Couldn't parse AI response as JSON. First 200 chars: "+clean.substring(0,200));}
        const invoices=Array.isArray(parsed)?parsed:[parsed];
        // Default missing truckId to INVENTORY
        invoices.forEach(inv=>{
          if(!inv.truckId||inv.truckId==="null"||inv.truckId==="UNKNOWN")inv.truckId="INVENTORY";
        });
        // CLIENT BACKSTOP for Quick Fuel: if the AI returned multiple rows from one weekly
        // fuel card invoice but used the same invoiceNum on all of them (no per-truck suffix),
        // the dedup step would throw away all but the first. Auto-suffix them with truckId.
        const isQuickFuel=invoices.length>1&&invoices.every(v=>(v.vendor||"").toLowerCase().includes("quick fuel")||(v.category||"")==="Fuel");
        if(isQuickFuel){
          const invNumCounts={};
          invoices.forEach(inv=>{
            if(!inv.invoiceNum)return;
            invNumCounts[inv.invoiceNum]=(invNumCounts[inv.invoiceNum]||0)+1;
          });
          const seenSuffixes={};
          invoices.forEach(inv=>{
            if(!inv.invoiceNum)return;
            if(invNumCounts[inv.invoiceNum]>1){
              const tid=inv.truckId==="INVENTORY"?"UNASSIGNED":inv.truckId;
              const base=`${inv.invoiceNum}-${tid}`;
              seenSuffixes[base]=(seenSuffixes[base]||0)+1;
              inv.invoiceNum=seenSuffixes[base]>1?`${base}-${seenSuffixes[base]}`:base;
            }
          });
        }
        if(invoices.length===1){
          updated[i].status="parsed";
          updated[i].parsed=invoices[0];
        }else{
          updated[i].status="parsed";
          updated[i].parsed=invoices[0];
          // For multi-invoice PDFs (Quick Fuel truck splits, multi-invoice scans):
          // Propagate the file reference fields so every row can be viewed / uploaded
          // via the same underlying PDF. sharedFileId ensures we only upload once.
          const shareId=updated[i].sharedFileId||updated[i].id;
          updated[i].sharedFileId=shareId;
          for(let j=1;j<invoices.length;j++){
            const inv=invoices[j];
            const label=inv.truckId&&inv.truckId!=="INVENTORY"?`truck ${inv.truckId}`:`row ${j+1}`;
            updated.push({
              id:Date.now()+Math.random()+j,
              file:`${updated[i].origFileName||updated[i].file} (${label})`,
              dataUrl:null,
              status:"parsed",
              parsed:inv,
              type:updated[i].type,
              origFileName:updated[i].origFileName,
              origMimeType:updated[i].origMimeType,
              origDataUrl:updated[i].origDataUrl,
              sharedFileId:shareId,
              gmailRef:updated[i].gmailRef||null,
            });
          }
        }
      }catch(err){
        updated[i].status="error";
        updated[i].parsed={error:err.message||"Failed to parse"};
      }
      // v2.9.3: determine whether to retry
      if(updated[i].status==="parsed"){
        scanSucceeded=true;
      }else if(updated[i].status==="error"){
        const errMsg=String(updated[i].parsed?.error||"");
        const isUnfixable=UNFIXABLE_ERROR_PATTERNS.some(rx=>rx.test(errMsg));
        if(isUnfixable){
          break; // don't retry — error is permanent
        }
        // Otherwise fall through and loop retries (if attempts remain)
      }else{
        // Unknown state — treat as success to avoid infinite loop
        scanSucceeded=true;
      }
      }
      // Annotate the error with how many attempts were made
      if(!scanSucceeded&&updated[i].status==="error"&&scanAttempt>1){
        updated[i].parsed={...updated[i].parsed,error:`${updated[i].parsed.error} (failed after ${scanAttempt} attempts)`};
      }
      setScanQueue([...updated]);
      // v2.9.2: throttle scans to stay under Anthropic's 30k tokens/min
      if(i<updated.length-1)await new Promise(r=>setTimeout(r,600));
    }
    setScanning(false);
  };

  const confirmScannedInvoices=async()=>{
    // Build a set of existing invoice "fingerprints" — vendor+invNum+total rounded to cents.
    // Using invoiceNum alone was skipping legit per-truck rows of the same weekly fuel
    // invoice (e.g. CFS-4582698 has 40 truck rows that all needed to save).
    const fp=(c)=>`${(c.vendor||"").toLowerCase()}|${c.invoiceNum||""}|${Math.round((c.total||0)*100)}`;
    const existingFingerprints=new Set(costEntries.filter(c=>c.invoiceNum).map(fp));
    const newEntries=[];
    const skippedItems=[]; // track WHY each was skipped for transparency
    let uploadErrors=0;
    const items=scanQueue.filter(q=>q.status==="parsed"&&q.parsed&&!q.parsed.error);
    if(items.length===0){alert("No parsed invoices to save.");return;}

    setScanning(true);
    // Upload original files once per sharedFileId (for PDFs, all pages share one file)
    const uploadedByShared={};
    for(let idx=0;idx<items.length;idx++){
      const q=items[idx];
      const invNum=q.parsed.invoiceNum||null;
      const candidateFp=fp({vendor:q.parsed.vendor,invoiceNum:invNum,total:q.parsed.total});
      if(invNum&&existingFingerprints.has(candidateFp)){
        skippedItems.push({file:q.file,invNum,reason:"already in cost entries"});
        continue;
      }
      if(invNum&&newEntries.find(e=>fp(e)===candidateFp)){
        skippedItems.push({file:q.file,invNum,reason:"duplicate within this scan batch"});
        continue;
      }

      // Mark this item as uploading
      setScanQueue(prev=>prev.map(x=>x.id===q.id?{...x,status:"uploading"}:x));

      // Upload original file (once per source document)
      let fileUrl=null;let fileKey=null;
      const shareId=q.sharedFileId||q.id;
      if(uploadedByShared[shareId]){
        fileUrl=uploadedByShared[shareId].url;fileKey=uploadedByShared[shareId].key;
      }else if(q.origDataUrl){
        try{
          const base64=q.origDataUrl.split(",")[1];
          // Skip files over 5MB (Netlify function payload limit)
          const sizeBytes=(base64.length*3)/4;
          if(sizeBytes>5*1024*1024){
            console.log(`File too large (${Math.round(sizeBytes/1024/1024)}MB), skipping upload:`,q.origFileName);
            uploadErrors++;
          }else{
            const up=await fetch("/api/invoice-file",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filename:q.origFileName,mimeType:q.origMimeType,data:base64})});
            if(!up.ok){
              console.log(`Upload failed with status ${up.status}`);
              uploadErrors++;
            }else{
              const upData=await up.json();
              if(upData.success){
                fileUrl=upData.url;fileKey=upData.key;
                uploadedByShared[shareId]={url:fileUrl,key:fileKey};
              }else{
                console.log("Upload failed:",upData.error);
                uploadErrors++;
              }
            }
          }
        }catch(e){console.log("File upload failed:",e.message);uploadErrors++;}
      }

      // Truck ID: default to INVENTORY if missing
      let truckId=q.parsed.truckId;
      if(!truckId||truckId==="null"||truckId==="UNKNOWN")truckId="INVENTORY";

      newEntries.push({
        id:Date.now()+Math.random(),
        truckId,
        vendor:q.parsed.vendor||"Unknown",
        date:q.parsed.date||new Date().toISOString().split("T")[0],
        invoiceNum:invNum,
        total:q.parsed.total||0,
        category:q.parsed.category||(truckId==="INVENTORY"?"Inventory":"Other"),
        lineItems:q.parsed.lineItems||[],
        notes:q.parsed.notes||"",
        sourceFile:q.file,
        fileUrl,
        fileKey,
        gmailRef:q.gmailRef||null,
        // Fuel-specific fields (auto-compute pricePerGallon if not provided but we have gallons)
        gallons:q.parsed.gallons!=null?Number(q.parsed.gallons):null,
        pricePerGallon:q.parsed.pricePerGallon!=null?Number(q.parsed.pricePerGallon):(q.parsed.gallons&&q.parsed.total?Number((q.parsed.total/q.parsed.gallons).toFixed(4)):null),
        addedAt:new Date().toISOString(),
      });
    }
    if(newEntries.length>0){
      const next=[...newEntries,...costEntries];
      saveCosts(next);
    }
    setScanning(false);
    const msgs=[];
    if(newEntries.length>0)msgs.push(`Saved ${newEntries.length} invoice${newEntries.length>1?"s":""}.`);
    if(skippedItems.length>0){
      const byReason={};
      skippedItems.forEach(s=>{byReason[s.reason]=(byReason[s.reason]||0)+1;});
      const breakdown=Object.entries(byReason).map(([r,n])=>`  • ${n} ${r}`).join("\n");
      msgs.push(`Skipped ${skippedItems.length} duplicate${skippedItems.length>1?"s":""}:\n${breakdown}`);
    }
    if(uploadErrors>0)msgs.push(`⚠️ ${uploadErrors} PDF${uploadErrors>1?"s":""} couldn't be saved (file too large) — entries still created, just no PDF attached.`);
    if(msgs.length>0)alert(msgs.join("\n"));
    setScanQueue([]);
  };

  const addManualCost=(entry)=>{
    const next=[{...entry,id:Date.now()+Math.random(),addedAt:new Date().toISOString()},...costEntries];
    saveCosts(next);
  };

  const deleteCost=(id)=>{
    if(!confirm("Delete this cost entry?"))return;
    saveCosts(costEntries.filter(c=>c.id!==id));
  };

  // Inventory allocation — assign inventory invoice to a truck
  const[allocModal,setAllocModal]=useState(null);
  const[reassignModal,setReassignModal]=useState(null);
  const allocateInventory=(entryId,truckId)=>{
    const next=costEntries.map(c=>c.id===entryId?{...c,allocatedToTruck:truckId,allocatedDate:new Date().toISOString().split("T")[0]}:c);
    saveCosts(next);
    setAllocModal(null);
  };
  const unallocateInventory=(entryId)=>{
    const next=costEntries.map(c=>c.id===entryId?{...c,allocatedToTruck:null,allocatedDate:null}:c);
    saveCosts(next);
  };
  const reassignCost=(entryId,newTruckId)=>{
    const next=costEntries.map(c=>{
      if(c.id!==entryId)return c;
      const isInv=newTruckId==="INVENTORY";
      return{...c,truckId:newTruckId,category:isInv?"Inventory":c.category,allocatedToTruck:null,allocatedDate:null};
    });
    saveCosts(next);
    setReassignModal(null);
  };

  // Inventory analytics
  const inventoryAnalytics=useMemo(()=>{
    const inv=costEntries.filter(c=>c.truckId==="INVENTORY"||c.category==="Inventory");
    const unallocated=inv.filter(c=>!c.allocatedToTruck);
    const allocated=inv.filter(c=>c.allocatedToTruck);
    const totalSpend=inv.reduce((s,c)=>s+(c.total||0),0);
    const unallocatedValue=unallocated.reduce((s,c)=>s+(c.total||0),0);
    const allocatedValue=allocated.reduce((s,c)=>s+(c.total||0),0);
    // Group unallocated by vendor
    const byVendor={};
    inv.forEach(c=>{byVendor[c.vendor]=(byVendor[c.vendor]||0)+(c.total||0);});
    // Monthly trend
    const byMonth={};
    inv.forEach(c=>{const m=(c.date||"").substring(0,7);if(m)byMonth[m]=(byMonth[m]||0)+(c.total||0);});
    // Allocated to which trucks
    const allocByTruck={};
    allocated.forEach(c=>{allocByTruck[c.allocatedToTruck]=(allocByTruck[c.allocatedToTruck]||0)+(c.total||0);});
    return{inv,unallocated,allocated,totalSpend,unallocatedValue,allocatedValue,byVendor,byMonth,allocByTruck};
  },[costEntries]);

  // Cost analytics
  const costAnalytics=useMemo(()=>{
    const byTruck={};const byCat={};const byVendor={};const byMonth={};const byTruckMonth={};
    let totalAll=0;
    let truckCount=0, inventoryCount=0;
    let truckTotal=0, inventoryTotal=0;
    costEntries.forEach(c=>{
      const amt=c.total||0;
      totalAll+=amt;
      const isInv=c.truckId==="INVENTORY"||c.category==="Inventory";
      if(isInv){inventoryCount++;inventoryTotal+=amt;}
      else{truckCount++;truckTotal+=amt;}
      // By truck
      if(!byTruck[c.truckId])byTruck[c.truckId]={total:0,count:0,cats:{}};
      byTruck[c.truckId].total+=amt;
      byTruck[c.truckId].count++;
      if(!byTruck[c.truckId].cats[c.category])byTruck[c.truckId].cats[c.category]=0;
      byTruck[c.truckId].cats[c.category]+=amt;
      // By category
      if(!byCat[c.category])byCat[c.category]=0;
      byCat[c.category]+=amt;
      // By vendor
      if(!byVendor[c.vendor])byVendor[c.vendor]={total:0,count:0};
      byVendor[c.vendor].total+=amt;
      byVendor[c.vendor].count++;
      // By month
      const mk=(c.date||"").substring(0,7);
      if(mk){
        if(!byMonth[mk])byMonth[mk]={total:0,count:0,byCat:{}};
        byMonth[mk].total+=amt;
        byMonth[mk].count++;
        if(!byMonth[mk].byCat[c.category])byMonth[mk].byCat[c.category]=0;
        byMonth[mk].byCat[c.category]+=amt;
        // Truck x Month
        const tmKey=`${c.truckId}|${mk}`;
        if(!byTruckMonth[tmKey])byTruckMonth[tmKey]=0;
        byTruckMonth[tmKey]+=amt;
      }
    });
    const topTrucks=Object.entries(byTruck).sort((a,b)=>b[1].total-a[1].total).slice(0,10);
    const topVendors=Object.entries(byVendor).sort((a,b)=>b[1].total-a[1].total).slice(0,10);
    const sortedMonths=Object.keys(byMonth).sort();
    // Trailing 12 months
    const last12=sortedMonths.slice(-12);
    // Avg monthly spend
    const avgMonthly=sortedMonths.length>0?totalAll/sortedMonths.length:0;
    // Growth: last month vs previous month
    let momChange=0;
    if(sortedMonths.length>=2){
      const lastM=byMonth[sortedMonths[sortedMonths.length-1]].total;
      const prevM=byMonth[sortedMonths[sortedMonths.length-2]].total;
      if(prevM>0)momChange=((lastM-prevM)/prevM)*100;
    }
    return{byTruck,byCat,byVendor,byMonth,byTruckMonth,totalAll,topTrucks,topVendors,sortedMonths,last12,avgMonthly,momChange,truckCount,inventoryCount,truckTotal,inventoryTotal,entryCount:costEntries.length};
  },[costEntries]);

  // ── Quick Fuel detailed report (per-truck + per-week + driver cross-reference) ──
  const quickFuelAnalytics=useMemo(()=>{
    const qfEntries=costEntries.filter(c=>(c.vendor||"").toLowerCase()==="quick fuel");
    if(qfEntries.length===0)return null;

    // Parse gallons from lineItems description (e.g. "12.5 gallons diesel")
    // or fall back to c.gallons if present
    const parseGallons=(c)=>{
      if(c.gallons)return Number(c.gallons)||0;
      const li=c.lineItems||[];
      for(const item of li){
        const m=(item.desc||"").match(/(\d+\.?\d*)\s*gal/i);
        if(m)return Number(m[1])||0;
      }
      return 0;
    };

    // Look up driver(s) who were on a given truck during the week containing `date`
    const driversForTruckOnDate=(truckId,dateStr)=>{
      if(!dateStr||!truckId||truckId==="INVENTORY")return [];
      const weekKey=wK(new Date(dateStr));
      const weekAsgn=attendWeeks[weekKey];
      if(!weekAsgn)return [];
      const names=new Set();
      drivers.forEach(d=>{
        DAYS.forEach(day=>{
          if(weekAsgn[`${d.name}-${day}`]===truckId)names.add(d.name);
        });
      });
      return [...names];
    };

    // Aggregate
    const byTruck={}; // truckId -> {entries[], gallons, cost, drivers:Set, weeks:Set}
    const byDriver={}; // name -> {gallons, cost, trucks:Set, weeks:Set, entries[]}
    const byWeek={}; // weekKey -> {entries[], gallons, cost, trucks:Set, drivers:Set}

    qfEntries.forEach(c=>{
      const truckId=c.truckId||"INVENTORY";
      const gallons=parseGallons(c);
      const cost=Number(c.total)||0;
      const wkKey=c.date?wK(new Date(c.date)):"unknown";
      const driverList=driversForTruckOnDate(truckId,c.date);

      // By truck
      if(!byTruck[truckId])byTruck[truckId]={entries:[],gallons:0,cost:0,drivers:new Set(),weeks:new Set()};
      byTruck[truckId].entries.push({...c,_gallons:gallons,_drivers:driverList});
      byTruck[truckId].gallons+=gallons;
      byTruck[truckId].cost+=cost;
      byTruck[truckId].weeks.add(wkKey);
      driverList.forEach(d=>byTruck[truckId].drivers.add(d));

      // By driver (one entry duplicated across all drivers on that truck that week)
      driverList.forEach(drv=>{
        if(!byDriver[drv])byDriver[drv]={gallons:0,cost:0,trucks:new Set(),weeks:new Set(),entries:[]};
        byDriver[drv].gallons+=gallons/Math.max(1,driverList.length); // split if multiple
        byDriver[drv].cost+=cost/Math.max(1,driverList.length);
        byDriver[drv].trucks.add(truckId);
        byDriver[drv].weeks.add(wkKey);
        byDriver[drv].entries.push({...c,_gallons:gallons,_shareOf:driverList.length});
      });

      // Unassigned fuel (INVENTORY or no driver found)
      if(driverList.length===0){
        if(!byDriver["— Unassigned —"])byDriver["— Unassigned —"]={gallons:0,cost:0,trucks:new Set(),weeks:new Set(),entries:[]};
        byDriver["— Unassigned —"].gallons+=gallons;
        byDriver["— Unassigned —"].cost+=cost;
        byDriver["— Unassigned —"].trucks.add(truckId);
        byDriver["— Unassigned —"].weeks.add(wkKey);
        byDriver["— Unassigned —"].entries.push({...c,_gallons:gallons,_shareOf:1});
      }

      // By week
      if(!byWeek[wkKey])byWeek[wkKey]={entries:[],gallons:0,cost:0,trucks:new Set(),drivers:new Set()};
      byWeek[wkKey].entries.push({...c,_gallons:gallons,_drivers:driverList});
      byWeek[wkKey].gallons+=gallons;
      byWeek[wkKey].cost+=cost;
      byWeek[wkKey].trucks.add(truckId);
      driverList.forEach(d=>byWeek[wkKey].drivers.add(d));
    });

    const totalGallons=qfEntries.reduce((a,c)=>a+parseGallons(c),0);
    const totalCost=qfEntries.reduce((a,c)=>a+(Number(c.total)||0),0);
    const avgPrice=totalGallons>0?totalCost/totalGallons:0;

    return{
      qfEntries,
      byTruck,byDriver,byWeek,
      totalGallons,totalCost,avgPrice,
      truckCount:Object.keys(byTruck).length,
      driverCount:Object.keys(byDriver).filter(d=>d!=="— Unassigned —").length,
      weekCount:Object.keys(byWeek).length,
    };
  },[costEntries,attendWeeks,drivers]);

  // History: which drivers have driven a specific truck
  const getTruckDriverHistory=useCallback((truckId)=>{
    const driverDays={};
    Object.entries(attendWeeks).forEach(([weekKey,weekAsgn])=>{
      DAYS.forEach(day=>{
        drivers.forEach(d=>{
          const v=weekAsgn[`${d.name}-${day}`]||"";
          if(v===truckId){
            if(!driverDays[d.name])driverDays[d.name]={days:0,weeks:new Set(),role:d.role};
            driverDays[d.name].days++;
            driverDays[d.name].weeks.add(weekKey);
          }
        });
      });
    });
    // Also check current week
    DAYS.forEach(day=>{
      drivers.forEach(d=>{
        const v=asgn[`${d.name}-${day}`]||"";
        if(v===truckId){
          if(!driverDays[d.name])driverDays[d.name]={days:0,weeks:new Set(),role:d.role};
          driverDays[d.name].days++;
          driverDays[d.name].weeks.add(wk);
        }
      });
    });
    return Object.entries(driverDays).map(([name,data])=>({name,days:data.days,weeks:data.weeks.size,role:data.role})).sort((a,b)=>b.days-a.days);
  },[attendWeeks,asgn,drivers,wk]);

  // History: which trucks a specific driver has driven
  const getDriverTruckHistory=useCallback((driverName)=>{
    const truckDays={};
    Object.entries(attendWeeks).forEach(([weekKey,weekAsgn])=>{
      DAYS.forEach(day=>{
        const v=weekAsgn[`${driverName}-${day}`]||"";
        if(v&&!OFF_OPTS.includes(v)&&v!==""){
          if(!truckDays[v])truckDays[v]={days:0,lastSeen:null};
          truckDays[v].days++;
          const m=gM(new Date(weekKey+"T00:00:00"));
          const dt=new Date(m);dt.setDate(dt.getDate()+DAYS.indexOf(day));
          if(!truckDays[v].lastSeen||dt>truckDays[v].lastSeen)truckDays[v].lastSeen=dt;
        }
      });
    });
    // Also check current week
    DAYS.forEach(day=>{
      const v=asgn[`${driverName}-${day}`]||"";
      if(v&&!OFF_OPTS.includes(v)&&v!==""){
        if(!truckDays[v])truckDays[v]={days:0,lastSeen:null};
        truckDays[v].days++;
        const m=gM(weekDate);
        const dt=new Date(m);dt.setDate(dt.getDate()+DAYS.indexOf(day));
        if(!truckDays[v].lastSeen||dt>truckDays[v].lastSeen)truckDays[v].lastSeen=dt;
      }
    });
    return Object.entries(truckDays).map(([tid,data])=>{
      const t=trucks.find(x=>x.id===tid);
      return{truckId:tid,days:data.days,lastSeen:data.lastSeen,type:t?.type,mk:t?.mk,tr:t?.tr};
    }).sort((a,b)=>b.days-a.days);
  },[attendWeeks,asgn,trucks,weekDate]);

  const prevW=()=>{const d=new Date(weekDate);d.setDate(d.getDate()-7);setWeekDate(d);};
  const nextW=()=>{const d=new Date(weekDate);d.setDate(d.getDate()+7);setWeekDate(d);};

  // Same as Yesterday: copy previous day's assignments to a target day
  const sameAsYesterday=(targetDayIdx)=>{
    if(targetDayIdx<0||targetDayIdx>4)return;
    const targetDay=DAYS[targetDayIdx];
    const prevDay=targetDayIdx>0?DAYS[targetDayIdx-1]:null;
    if(!prevDay){alert("No previous day to copy from on Monday. Use previous week's Friday manually.");return;}
    const next={...asgn};
    let copied=0;
    drivers.forEach(d=>{
      const prevVal=asgn[`${d.name}-${prevDay}`]||"";
      if(prevVal){next[`${d.name}-${targetDay}`]=prevVal;copied++;}
    });
    if(copied>0){saveAsgn(next);alert(`Copied ${copied} assignments from ${prevDay} → ${targetDay}`);}
    else alert(`No assignments found for ${prevDay} to copy.`);
  };

  // Computed: assigned trucks per day
  const usedByDay=useMemo(()=>{const m={};DAYS.forEach(day=>{const u=new Set();drivers.forEach(d=>{const v=asgn[`${d.name}-${day}`];if(v&&!OFF_OPTS.includes(v)&&v!=="")u.add(v);});m[day]=u;});return m;},[asgn,drivers]);
  const downByDay=useMemo(()=>{const m={};DAYS.forEach(day=>{const s=new Set();trucks.forEach(t=>{const n=(tStat[`${t.id}-${day}`]||"").toLowerCase();if(n==="oos"||n==="bd"||n.includes("interstate")||n.includes("repair")||n==="4sale"||n.includes("mech"))s.add(t.id);});m[day]=s;});return m;},[tStat,trucks]);

  const getAvail=useCallback((role,day,cur)=>{
    const type=dTT(role);const used=usedByDay[day]||new Set();const down=downByDay[day]||new Set();
    return trucks.filter(t=>{if(type!=="all"&&t.type!==type)return false;if(down.has(t.id))return false;if(used.has(t.id)&&t.id!==cur)return false;return true;});
  },[trucks,usedByDay,downByDay]);

  const gTS=(id,day)=>{
    // 1. Open repair → always show as repair/oos
    const hasOpenRepair=repairs.some(r=>r.truckId===id&&r.status==="open");
    if(hasOpenRepair)return"oos";
    const st=tStat[`${id}-${day}`]||"";
    const stl=st.toLowerCase().trim();
    // 2. Explicit down statuses from truck status board
    if(stl==="oos"||stl==="bd")return"oos";
    if(stl.includes("interstate")||stl.includes("repair")||stl.includes("shop")||stl.includes("mech"))return"repair";
    if(stl.includes("sale"))return"for-sale";
    // 3. Supervisor explicitly marked available
    if(stl==="here"||stl==="avail"||stl==="available"||stl==="ok")return"available";
    // 4. Driver assigned to this truck today
    const hasDriver=drivers.some(d=>{const v=asgn[`${d.name}-${day}`];return v===id;});
    if(hasDriver)return"assigned";
    // 5. Truck status has driver initials or other value → assigned
    if(st&&st!=="")return"assigned";
    // 6. Was used a previous day this week but not today → needs assignment
    const di=DAYS.indexOf(day);
    for(let i=di-1;i>=0;i--){
      const prev=drivers.some(d=>asgn[`${d.name}-${DAYS[i]}`]===id);
      if(prev)return"unassigned";
      const ps=(tStat[`${id}-${DAYS[i]}`]||"").toLowerCase();
      if(ps&&ps!=="here"&&ps!=="avail"&&ps!=="available"&&ps!=="ok"&&ps!=="oos"&&ps!=="bd"&&!ps.includes("sale"))return"unassigned";
    }
    // 7. No history at all → available
    return"available";
  };

  // Dashboard stats
  const stats=useMemo(()=>{
    const dk=DAYS[Math.min(todayDI(),4)];
    let assigned=new Set(),oos=0,repair=0,avail=0;
    trucks.forEach(t=>{
      const hasOpenRepair=repairs.some(r=>r.truckId===t.id&&r.status==="open");
      if(hasOpenRepair){oos++;return;}
      const s=tStat[`${t.id}-${dk}`];if(!s||s===""||s.toLowerCase()==="here")avail++;else if(s.toLowerCase()==="oos"||s.toLowerCase()==="bd")oos++;else if(s.toLowerCase().includes("interstate")||s.toLowerCase().includes("repair"))repair++;else assigned.add(t.id);
    });
    drivers.forEach(d=>{const v=asgn[`${d.name}-${dk}`];if(v&&!OFF_OPTS.includes(v)&&v!=="")assigned.add(v);});
    return{total:trucks.length,straight:trucks.filter(t=>t.type==="straight").length,tractor:trucks.filter(t=>t.type==="tractor").length,auto:trucks.filter(t=>t.tr==="A").length,manual:trucks.filter(t=>t.tr==="M").length,autoBox:trucks.filter(t=>t.tr==="A"&&t.type==="straight").length,autoTr:trucks.filter(t=>t.tr==="A"&&t.type==="tractor").length,manBox:trucks.filter(t=>t.tr==="M"&&t.type==="straight").length,manTr:trucks.filter(t=>t.tr==="M"&&t.type==="tractor").length,assigned:assigned.size,oos,repair,avail,drivers:drivers.length,davis:drivers.filter(d=>d.category==="Davis").length,owner:drivers.filter(d=>d.category==="Owner").length,openRepairs:repairs.filter(r=>r.status==="open").length};
  },[trucks,drivers,asgn,tStat,repairs]);

  const filteredTrucks=useMemo(()=>trucks.filter(t=>{
    if(search&&!t.id.includes(search)&&!t.mk.toLowerCase().includes(search.toLowerCase()))return false;
    if(filterType==="straight"&&t.type!=="straight")return false;if(filterType==="tractor"&&t.type!=="tractor")return false;
    if(filterType==="auto"&&t.tr!=="A")return false;if(filterType==="manual"&&t.tr!=="M")return false;
    if(filterType==="tandem"&&t.ax!=="Tandem")return false;if(filterType==="single"&&t.ax!=="Single")return false;
    return true;
  }),[trucks,search,filterType]);

  const filteredRG=useMemo(()=>{
    if(boardFilter==="all")return RG;if(boardFilter==="box")return RG.filter(g=>g.key.includes("s")&&!g.key.includes("ul")&&!g.key.includes("ls"));
    if(boardFilter==="tractor")return RG.filter(g=>g.key.includes("t")&&!g.key.includes("ls"));if(boardFilter==="shuttle")return RG.filter(g=>g.key==="ul");
    if(boardFilter==="load")return RG.filter(g=>g.key==="ls");if(boardFilter==="owner")return RG.filter(g=>g.key.startsWith("o"));return RG;
  },[boardFilter]);

  // Attendance computation
  const attendance=useMemo(()=>{
    const result={};
    drivers.forEach(d=>{result[d.name]={worked:0,off:0,vac:0,calledOut:0,noShow:0,unassigned:0,totalDays:0};});
    Object.entries(attendWeeks).forEach(([weekKey,weekAsgn])=>{
      DAYS.forEach(day=>{
        drivers.forEach(d=>{
          const v=weekAsgn[`${d.name}-${day}`]||"";
          const a=result[d.name];if(!a)return;
          a.totalDays++;
          if(!v||v==="")a.unassigned++;
          else if(v==="OFF")a.off++;
          else if(v==="VAC")a.vac++;
          else if(v==="CALLED OUT")a.calledOut++;
          else if(v==="NO SHOW")a.noShow++;
          else a.worked++;
        });
      });
    });
    return result;
  },[drivers,attendWeeks]);

  const startEdit=(key,cur)=>{setEditCell(key);setEditVal(cur||"");};
  const commitEdit=(key,type,value)=>{const val=value!==undefined?value:editVal;if(type==="assign")saveAsgn({...asgn,[key]:val});else saveTStat({...tStat,[key]:val});setEditCell(null);setEditVal("");};

  // Find which driver is assigned to a specific truck (check today first, then scan all days)
  const findDriverForTruck=(truckId)=>{
    const ti=todayDI();
    // Check today first
    const todayDriver=drivers.find(d=>{const v=asgn[`${d.name}-${DAYS[Math.min(ti,4)]}`];return v===truckId;});
    if(todayDriver)return todayDriver;
    // Scan all days (most recent first)
    for(let i=4;i>=0;i--){
      if(i===ti)continue;
      const dr=drivers.find(d=>{const v=asgn[`${d.name}-${DAYS[i]}`];return v===truckId;});
      if(dr)return dr;
    }
    return null;
  };
  // Repair functions
  const addRepair=(truckId)=>{
    const rec={id:Date.now(),truckId,reason:repairForm.reason,notes:repairForm.notes,shop:repairForm.shop,dateIn:new Date().toISOString(),estReturn:repairForm.estReturn||null,cost:repairForm.cost?Number(repairForm.cost):0,dateClosed:null,status:"open"};
    const next=[rec,...repairs];
    saveRepairs(next);
    setRepairForm({reason:"Mechanical Repair",notes:"",shop:"",estReturn:"",cost:""});
    setShowRepairForm(null);
  };
  const closeRepair=(id,cost)=>{
    const repair=repairs.find(r=>r.id===id);
    const next=repairs.map(r=>r.id===id?{...r,status:"closed",dateClosed:new Date().toISOString(),cost:cost||r.cost}:r);
    saveRepairs(next);
    // Clear OOS status for today and remaining days this week
    if(repair){
      const ti=Math.min(todayDI(),4);
      const nextStat={...tStat};
      let cleared=false;
      for(let i=ti;i<5;i++){
        const key=`${repair.truckId}-${DAYS[i]}`;
        const cur=(nextStat[key]||"").toLowerCase();
        if(cur==="oos"||cur==="bd"||cur.includes("repair")||cur.includes("interstate")||cur.includes("shop")||cur.includes("mech")){
          nextStat[key]="HERE";
          cleared=true;
        }
      }
      if(cleared)saveTStat(nextStat);
    }
  };

  const addDriver=()=>{if(!newD.name.trim())return;saveDrivers([...drivers,{...newD}]);setNewD({name:"",role:"Davis Straight Driver",category:"Davis"});setShowAddD(false);};
  const addTruck=()=>{if(!newT.id.trim()||trucks.find(t=>t.id===newT.id))return;saveTrucks([...trucks,{...newT}]);setNewT({id:"",mk:"FRTLN",tr:"A",ax:"Single",type:"straight"});setShowAddT(false);};
  const removeTruck=id=>{
    const hasCosts=costEntries.some(c=>c.truckId===id);
    if(hasCosts){
      const choice=confirm(`Truck ${id} has historical cost data.\n\nOK = Move to Retired (keeps history)\nCancel = Keep in fleet`);
      if(!choice)return;
      const t=trucks.find(x=>x.id===id);
      saveRetiredTrucks([...retiredTrucks,{id,mk:t?.mk||"FRTLN",retiredDate:new Date().toISOString().split("T")[0],reason:"Manually retired"}]);
      saveTrucks(trucks.filter(t=>t.id!==id));
    }else{
      if(!confirm(`Remove truck ${id}?`))return;
      saveTrucks(trucks.filter(t=>t.id!==id));
    }
  };
  const removeDriver=name=>{if(!confirm(`Remove ${name}?`))return;saveDrivers(drivers.filter(d=>d.name!==name));};

  if(!loaded)return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#f5f7fa"}}><div style={{width:36,height:36,border:"3px solid #dde3ea",borderTop:`3px solid ${C.brand}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  const dk=DAYS[Math.min(todayDI(),4)];

  return(
    <div style={s.wrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box} button{-webkit-tap-highlight-color:transparent;-webkit-appearance:none;-moz-appearance:none;appearance:none;user-select:none} button:focus{outline:none} button:focus-visible{outline:2px solid ${C.brand};outline-offset:-2px}`}</style>
      {/* Header */}
      <div style={s.header}><div style={s.hInner}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={DAVIS_LOGO} alt="Davis Delivery" style={{height:44,width:"auto"}}/>
          <div style={{borderLeft:`2px solid ${C.brand}33`,paddingLeft:10}}><div style={{fontSize:13,fontWeight:700,color:C.dark,lineHeight:1.2}}>Fleet</div><div style={{fontSize:13,fontWeight:700,color:C.dark,lineHeight:1.2}}>Management</div><div style={{fontSize:8,color:"#94a3b8",marginTop:1}}>v{APP_VERSION}</div></div>
        </div>
        <div style={s.tabs}>
          {[["dispatch","Dispatch"],["dashboard","Dashboard"],["board","Weekly Board"],["fleet","Fleet"],["maint","Maintenance"],["costs","Costs"],["drivers","Drivers"],["attend","Attendance"]].map(([k,l])=>
            <button key={k} onClick={()=>setTab(k)} style={tab===k?{...s.tab,...s.tabOn}:s.tab}>{l}{k==="maint"&&stats.openRepairs>0?<span style={s.badge}>{stats.openRepairs}</span>:null}</button>
          )}
        </div>
      </div></div>

      <div style={s.body}>

        {/* ══ DAILY DISPATCH ══ */}
        {tab==="dispatch"&&(()=>{
          const di=Math.min(todayDI(),4);
          const today=DAYS[di];
          const mon=gM(weekDate);
          const todayDate=new Date(mon);todayDate.setDate(todayDate.getDate()+di);
          const dayFull=["Monday","Tuesday","Wednesday","Thursday","Friday"][di];

          // Categorize drivers
          const working=[];const off=[];const calledOut=[];const noTruck=[];
          drivers.filter(d=>d.category==="Davis").forEach(d=>{
            const v=asgn[`${d.name}-${today}`]||"";
            if(!v||v==="")noTruck.push(d);
            else if(v==="OFF"||v==="VAC")off.push({...d,status:v});
            else if(v==="CALLED OUT"||v==="NO SHOW")calledOut.push({...d,status:v});
            else working.push({...d,truck:v,truckInfo:trucks.find(t=>t.id===v)});
          });
          const ownerWorking=[];const ownerOff=[];
          drivers.filter(d=>d.category==="Owner").forEach(d=>{
            const v=asgn[`${d.name}-${today}`]||"";
            if(v&&!OFF_OPTS.includes(v))ownerWorking.push({...d,truck:v,truckInfo:trucks.find(t=>t.id===v)});
            else if(OFF_OPTS.includes(v))ownerOff.push({...d,status:v});
          });

          // Truck status
          const trucksInUse=new Set();
          working.concat(ownerWorking).forEach(d=>trucksInUse.add(d.truck));
          const trucksDown=trucks.filter(t=>{const st=(tStat[`${t.id}-${today}`]||"").toLowerCase();return st==="oos"||st==="bd"||st.includes("interstate")||st.includes("repair")||st.includes("mech");});
          const trucksAvail=trucks.filter(t=>!trucksInUse.has(t.id)&&!trucksDown.find(x=>x.id===t.id));
          const openRep=repairs.filter(r=>r.status==="open");

          return <div>
            {/* Date header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:22,fontWeight:800,color:C.dark}}>{dayFull}</div>
                <div style={{fontSize:13,color:"#6b7785"}}>{todayDate.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>sameAsYesterday(di)} style={s.sayBtn}>📋 Same as Yesterday</button>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8,marginBottom:16}}>
              <div style={{background:C.green+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.green}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.green}}>{working.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Working</div>
              </div>
              <div style={{background:C.accent+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.accent}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.accent}}>{off.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Off/Vac</div>
              </div>
              <div style={{background:C.red+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.red}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.red}}>{calledOut.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Called Out</div>
              </div>
              <div style={{background:C.cyan+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.cyan}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.cyan}}>{trucksAvail.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Trucks Free</div>
              </div>
              <div style={{background:C.red+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.red}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.red}}>{trucksDown.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Down</div>
              </div>
            </div>

            {/* Needs attention */}
            {(noTruck.length>0||calledOut.length>0||openRep.length>0)&&<div style={{background:"#fef2f2",border:`1px solid ${C.red}22`,borderRadius:8,padding:12,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>⚠ Needs Attention</div>
              {noTruck.length>0&&<div style={{fontSize:12,color:"#334155",marginBottom:4}}><span style={{fontWeight:700}}>{noTruck.length} driver{noTruck.length>1?"s":""}</span> not assigned a truck: {noTruck.slice(0,5).map(d=>d.name.split(" ")[0]).join(", ")}{noTruck.length>5?"...":""}</div>}
              {calledOut.length>0&&<div style={{fontSize:12,color:C.red,marginBottom:4}}>{calledOut.map(d=><span key={d.name} style={{marginRight:8}}><span style={{fontWeight:700}}>{d.name.split(" ")[0]}</span> — {d.status}</span>)}</div>}
              {openRep.length>0&&<div style={{fontSize:12,color:C.yellow}}>{openRep.length} truck{openRep.length>1?"s":""} in repair: {openRep.map(r=>`#${r.truckId}`).join(", ")}</div>}
            </div>}

            {/* Working drivers */}
            <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:6}}>ON THE ROAD — {working.length} Davis + {ownerWorking.length} Owner</div>
            <div style={s.tWrap}><table style={{...s.table,fontSize:12}}><thead><tr>
              <th style={s.th}>Driver</th><th style={s.th}>Truck</th><th style={s.th}>Type</th><th style={s.th}>Trans</th>
            </tr></thead><tbody>
              {working.map(d=> <tr key={d.name} style={s.tr}>
                <td style={{...s.ltd,fontWeight:600,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setDriverReport(d.name)}>{d.name}</td>
                <td style={{...s.ltd,fontFamily:"monospace",fontWeight:700,cursor:"pointer",color:C.brand,textDecoration:"underline"}} onClick={()=>setHistoryTruck(d.truck)}>#{d.truck}</td>
                <td style={s.ltd}>{d.truckInfo?d.truckInfo.type==="straight"?d.truckInfo.mk:"Tractor":"—"}</td>
                <td style={s.ltd}>{d.truckInfo?<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:d.truckInfo.tr==="A"?"#27ae6018":"#e6a81718",color:d.truckInfo.tr==="A"?C.green:C.accent}}>{d.truckInfo.tr==="A"?"A":"M"}</span>:"—"}</td>
              </tr>)}
              {ownerWorking.length>0&&<tr><td colSpan={4} style={s.roleDiv}>Owner Operators</td></tr>}
              {ownerWorking.map(d=> <tr key={d.name} style={s.tr}>
                <td style={{...s.ltd,fontWeight:600,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setDriverReport(d.name)}>{d.name}</td>
                <td style={{...s.ltd,fontFamily:"monospace",fontWeight:700,cursor:"pointer",color:C.brand,textDecoration:"underline"}} onClick={()=>setHistoryTruck(d.truck)}>#{d.truck}</td>
                <td style={s.ltd}>{d.truckInfo?d.truckInfo.type==="straight"?d.truckInfo.mk:"Tractor":"—"}</td>
                <td style={s.ltd}>{d.truckInfo?<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:d.truckInfo.tr==="A"?"#27ae6018":"#e6a81718",color:d.truckInfo.tr==="A"?C.green:C.accent}}>{d.truckInfo.tr==="A"?"A":"M"}</span>:"—"}</td>
              </tr>)}
            </tbody></table></div>

            {/* Off / Called Out */}
            {(off.length>0||calledOut.length>0)&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:6}}>NOT WORKING — {off.length+calledOut.length}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {calledOut.map(d=><span key={d.name} style={{fontSize:11,padding:"4px 10px",background:C.red+"14",color:C.red,borderRadius:6,fontWeight:600,border:`1px solid ${C.red}33`}}>{d.name.split(" ")[0]} — {d.status}</span>)}
                {off.map(d=><span key={d.name} style={{fontSize:11,padding:"4px 10px",background:"#f8fafc",color:"#6b7785",borderRadius:6,fontWeight:600,border:"1px solid #e2e8f0"}}>{d.name.split(" ")[0]} — {d.status}</span>)}
              </div>
            </div>}

            {/* No truck assigned */}
            {noTruck.length>0&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"#6b7785",marginBottom:6}}>NEEDS TRUCK — {noTruck.length}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {noTruck.map(d=><span key={d.name} style={{fontSize:11,padding:"4px 10px",background:"#fff",color:"#334155",borderRadius:6,fontWeight:600,border:"1px solid #e2e8f0"}}>{drvIcon(d.role)} {d.name.split(" ")[0]} <span style={{color:"#94a3b8"}}>({d.role.replace("Davis ","").replace("Owner ","")})</span></span>)}
              </div>
            </div>}

            {/* Available trucks */}
            {trucksAvail.length>0&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:C.cyan,marginBottom:6}}>AVAILABLE TRUCKS — {trucksAvail.length}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",gap:6}}>
                {trucksAvail.map(t=><div key={t.id} style={{padding:"8px 10px",background:"#fff",borderRadius:6,border:"1px solid #e2e8f0",cursor:"pointer"}} onClick={()=>setHistoryTruck(t.id)}>
                  <div style={{fontFamily:"monospace",fontWeight:700,fontSize:13,color:C.brand}}>#{t.id}</div>
                  <div style={{fontSize:10,color:"#6b7785"}}>{t.type==="straight"?t.mk:"Tractor"} · {t.tr==="A"?"A":"M"} · {t.ax==="Tandem"?"T":"S"}</div>
                </div>)}
              </div>
            </div>}

            {/* Down trucks */}
            {trucksDown.length>0&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:6}}>DOWN / OOS — {trucksDown.length}</div>
              {trucksDown.map(t=>{const r=repairs.find(x=>x.truckId===t.id&&x.status==="open");
                return <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:"#fef2f2",borderRadius:6,border:`1px solid ${C.red}22`,marginBottom:4,cursor:"pointer"}} onClick={()=>setHistoryTruck(t.id)}>
                  <div><span style={{fontFamily:"monospace",fontWeight:700,color:C.red}}>#{t.id}</span><span style={{fontSize:11,color:"#6b7785",marginLeft:8}}>{t.type==="straight"?t.mk:"Tractor"}</span></div>
                  {r&&<span style={{fontSize:10,color:C.red,fontWeight:600}}>{r.reason}{r.shop&&` · ${r.shop}`}</span>}
                </div>;
              })}
            </div>}
          </div>;
        })()}

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&<div>
          <div style={s.statGrid}>
            <Stat l="Total Fleet" v={stats.total} sub={`${stats.straight} Straight · ${stats.tractor} Tractor`} c={C.brand}/>
            <Stat l="Assigned Today" v={stats.assigned} c={C.green}/>
            <Stat l="Available" v={stats.avail} c={C.cyan}/>
            <Stat l="OOS / Down" v={stats.oos} c={C.red}/>
            <Stat l="Open Repairs" v={stats.openRepairs} c={C.yellow}/>
            <Stat l="Total Drivers" v={stats.drivers} sub={`${stats.davis} Davis · ${stats.owner} Owner Op`} c={C.purple}/>
            <Stat l="Automatic" v={stats.auto} sub={`${stats.autoBox} Box · ${stats.autoTr} Tractor`} c={C.green}/>
            <Stat l="Manual" v={stats.manual} sub={`${stats.manBox} Box · ${stats.manTr} Tractor`} c={C.accent}/>
          </div>
          <div style={{marginTop:20}}><div style={s.secT}>Fleet by Type</div>
            <div style={s.bGrid}>{[
              {l:"FRTLN Straight",ct:trucks.filter(t=>t.type==="straight"&&t.mk==="FRTLN").length},
              {l:"HINO Straight",ct:trucks.filter(t=>t.type==="straight"&&t.mk==="HINO").length},
              {l:"INTL Straight",ct:trucks.filter(t=>t.type==="straight"&&t.mk==="INTL").length},
              {l:"Ford Straight",ct:trucks.filter(t=>t.type==="straight"&&t.mk==="Ford").length},
              {l:"Tractor Single",ct:trucks.filter(t=>t.type==="tractor"&&t.ax==="Single").length},
              {l:"Tractor Tandem",ct:trucks.filter(t=>t.type==="tractor"&&t.ax==="Tandem").length},
            ].map(x=><div key={x.l} style={s.bItem}><span style={{fontSize:12,color:"#6b7785"}}>{x.l}</span><span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{x.ct}</span></div>)}</div>
          </div>

          {/* AI Fleet Advisor */}
          <div style={{marginTop:20}}>
            <div style={s.secT}>🤖 AI Fleet Advisor</div>
            <div style={{background:"#fff",borderRadius:10,padding:16,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:12,color:"#6b7785",marginBottom:10}}>AI analyzes your fleet data — assignments, costs, attendance, repairs — and flags issues you might not see. Ask anything or run a full analysis.</div>
              
              {/* Quick action buttons */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                <button onClick={()=>runAiAnalysis()} disabled={aiLoading} style={{...s.saveBtn,opacity:aiLoading?0.5:1,fontSize:12,padding:"8px 14px"}}>
                  {aiLoading?"🔄 Analyzing...":"🔍 Full Fleet Analysis"}
                </button>
                <button onClick={()=>runAiAnalysis("Which drivers have the worst attendance patterns? Look at call-outs, no-shows, and Monday/Friday absences. Name names and give me the data.")} disabled={aiLoading} style={{fontSize:11,padding:"8px 12px",background:"#fef2f2",color:C.red,border:`1px solid ${C.red}33`,borderRadius:6,cursor:"pointer",fontWeight:600}}>
                  ⚠️ Driver Attendance Issues
                </button>
                <button onClick={()=>runAiAnalysis("Which trucks are costing me the most money? Look at maintenance frequency, total spend, and whether any trucks should be retired. Compare cost per truck against fleet averages.")} disabled={aiLoading} style={{fontSize:11,padding:"8px 12px",background:"#fff7ed",color:C.accent,border:`1px solid ${C.accent}33`,borderRadius:6,cursor:"pointer",fontWeight:600}}>
                  💰 High-Cost Trucks
                </button>
                <button onClick={()=>runAiAnalysis("Are there any suspicious patterns in my maintenance spending? Look for duplicate charges, unusual spikes, trucks that suddenly need lots of work, or drivers who seem to break trucks more than others.")} disabled={aiLoading} style={{fontSize:11,padding:"8px 12px",background:"#f0f9ff",color:C.brand,border:`1px solid ${C.brand}33`,borderRadius:6,cursor:"pointer",fontWeight:600}}>
                  🔎 Suspicious Patterns
                </button>
              </div>

              {/* Custom question */}
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                <input value={aiQuestion} onChange={e=>setAiQuestion(e.target.value)} placeholder="Ask the AI anything about your fleet..." style={{...s.fInp,flex:1,fontSize:12}} onKeyDown={e=>{if(e.key==="Enter"&&aiQuestion.trim()){runAiAnalysis(aiQuestion);setAiQuestion("");}}}/>
                <button onClick={()=>{if(aiQuestion.trim()){runAiAnalysis(aiQuestion);setAiQuestion("");}}} disabled={aiLoading||!aiQuestion.trim()} style={{...s.saveBtn,padding:"8px 14px",fontSize:11,opacity:(!aiQuestion.trim()||aiLoading)?0.4:1}}>Ask</button>
              </div>

              {/* Loading state */}
              {aiLoading&&<div style={{padding:20,textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:8}}>🤖</div>
                <div style={{fontSize:12,color:"#6b7785"}}>Analyzing {costEntries.length} cost entries, {drivers.length} drivers, {repairs.length} repairs...</div>
                <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>This may take 10-15 seconds</div>
              </div>}

              {/* Results */}
              {aiInsights&&!aiLoading&&<div style={{marginTop:8,padding:14,background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0",maxHeight:500,overflowY:"auto"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>🤖 AI Analysis Results</div>
                  <button onClick={()=>setAiInsights(null)} style={{fontSize:10,color:"#94a3b8",background:"none",border:"none",cursor:"pointer"}}>✕ Clear</button>
                </div>
                <div style={{fontSize:12,lineHeight:1.7,color:"#334155",whiteSpace:"pre-wrap"}}>
                  {aiInsights.split(/(\*\*[^*]+\*\*)/).map((part,i)=>
                    part.startsWith("**")&&part.endsWith("**")?
                      <span key={i} style={{fontWeight:800,color:"#1e293b",display:"block",marginTop:12,marginBottom:4,fontSize:13}}>{part.replace(/\*\*/g,"")}</span>:
                      <span key={i}>{part}</span>
                  )}
                </div>
              </div>}
            </div>
          </div>
        </div>}

        {/* ══ WEEKLY BOARD ══ */}
        {tab==="board"&&<div>
          <div style={s.weekNav}>
            <button style={s.wBtn} onClick={prevW}>← Prev</button>
            <button style={s.wBtnA} onClick={()=>setWeekDate(new Date())}>This Week</button>
            <span style={s.wLbl}>{fWL(weekDate)}</span>
            <button style={s.wBtn} onClick={nextW}>Next →</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:600,color:"#6b7785"}}>Show:</span>
            <select style={s.bSel} value={boardFilter} onChange={e=>setBoardFilter(e.target.value)}>
              {BF.map(f=><option key={f.k} value={f.k}>{f.l}</option>)}
            </select>
            <button onClick={()=>document.getElementById("truck-status-board")?.scrollIntoView({behavior:"smooth"})} style={s.jumpBtn}>🚛 Truck Status ↓</button>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{...s.secT,marginBottom:0}}>Driver → Truck Assignments</div>
            <button onClick={()=>sameAsYesterday(todayDI())} style={s.sayBtn}>📋 Same as Yesterday</button>
          </div>
          <div style={s.tWrap}><table style={s.table}><thead><tr><th style={{...s.th,...s.thS}}>Driver</th>{DAYS.map((d,i)=><th key={d} style={s.th}>{d}{i>0&&<button onClick={()=>sameAsYesterday(i)} title={`Copy ${DAYS[i-1]} → ${d}`} style={s.sayMini}>←</button>}</th>)}</tr></thead><tbody>
            {filteredRG.map(g=>{
              const gd=drivers.filter(g.f);if(!gd.length)return null;
              return[
                <tr key={`h-${g.key}`}><td colSpan={6} style={{...s.roleDiv,color:g.color}}>{g.label} ({gd.length})</td></tr>,
                ...gd.map(dr=><tr key={dr.name} style={s.tr}><td style={{...s.td,...s.tdN,cursor:"pointer",color:C.brand,textDecoration:"underline",textDecorationColor:C.brand+"44"}} onClick={()=>setDriverReport(dr.name)}>{drvIcon(dr.role)} {dr.name}</td>
                  {DAYS.map(day=>{const ck=`${dr.name}-${day}`;const val=asgn[ck]||"";const isE=editCell===ck;const isOff=OFF_OPTS.includes(val);const ti=val&&!isOff?trucks.find(t=>t.id===val):null;
                    if(isE){const av=getAvail(dr.role,day,val);return <td key={day} style={{...s.td,...s.eCell}}><div style={s.ePanel}>
                      <div style={s.offRow}>{OFF_OPTS.map(o=><button key={o} onClick={()=>commitEdit(ck,"assign",o)} style={val===o?{...s.oBtn,...s.oBtnOn}:s.oBtn}>{o}</button>)}{val&&<button onClick={()=>commitEdit(ck,"assign","")} style={s.clrBtn}>✕</button>}</div>
                      <input style={s.cInp} value={editVal} placeholder="Truck #" onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&editVal.trim())commitEdit(ck,"assign");if(e.key==="Escape")setEditCell(null);}} autoFocus/>
                      {editVal.trim()&&<button onClick={()=>commitEdit(ck,"assign")} style={s.goBtn}>GO</button>}
                      <select style={s.tSel} value="" onChange={e=>{if(e.target.value)commitEdit(ck,"assign",e.target.value);}}>
                        <option value="">— Pick {dTT(dr.role)==="tractor"?"Tractor":dTT(dr.role)==="straight"?"Box Truck":"Truck"} —</option>
                        {av.map(t=><option key={t.id} value={t.id}>{t.id} · {t.type==="straight"?t.mk:"Tractor"} · {t.tr==="A"?"Auto":"Man"} · {t.ax==="Tandem"?"Tndm":"Sngl"}</option>)}
                      </select>
                      <button onClick={()=>setEditCell(null)} style={s.doneBtn}>Done</button>
                    </div></td>;}
                    return <td key={day} style={s.td} onClick={()=>startEdit(ck,val)}>{val?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <span style={{fontWeight:700,fontFamily:isOff?"inherit":"monospace",fontSize:isOff?9:12,color:isOff?C.accent:"#1e293b"}}>{val}</span>
                      {ti&&<span style={{fontSize:8,color:"#94a3b8"}}>{ti.mk} {ti.tr}</span>}
                    </div>:<span style={{color:"#cbd5e1"}}>—</span>}</td>;
                  })}
                </tr>)
              ];
            })}
          </tbody></table></div>

          {/* Truck Status Board */}
          <div style={{marginTop:24}} id="truck-status-board">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{...s.secT,marginBottom:0}}>Truck Status Board</div>
              <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={s.jumpBtn}>👤 Driver Assignments ↑</button>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:8,flexWrap:"wrap"}}>{Object.entries(SL).map(([k,v])=><span key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#6b7785"}}><span style={{width:8,height:8,borderRadius:4,background:SC[k]}}/>{v}</span>)}</div>
            <div style={s.tWrap}><table style={s.table}><thead><tr><th style={s.th}>Truck #</th><th style={s.th}>Type</th><th style={s.th}>Tr</th><th style={s.th}>Ax</th>{DAYS.map(d=><th key={d} style={s.th}>{d}</th>)}</tr></thead><tbody>
              <tr><td colSpan={9} style={s.secDiv}>Straight Trucks</td></tr>
              {trucks.filter(t=>t.type==="straight").map(t=><TSRow key={t.id} t={t} tStat={tStat} ec={editCell} ev={editVal} sev={setEditVal} se={startEdit} ce={commitEdit} gs={gTS} onOOS={()=>{setShowRepairForm(t.id);setRepairForm({reason:"Mechanical Repair",notes:"",shop:"",estReturn:"",cost:""});}}/>)}
              <tr><td colSpan={9} style={s.secDiv}>Tractors</td></tr>
              {trucks.filter(t=>t.type==="tractor").map(t=><TSRow key={t.id} t={t} tStat={tStat} ec={editCell} ev={editVal} sev={setEditVal} se={startEdit} ce={commitEdit} gs={gTS} onOOS={()=>{setShowRepairForm(t.id);setRepairForm({reason:"Mechanical Repair",notes:"",shop:"",estReturn:"",cost:""});}}/>)}
            </tbody></table></div>
          </div>
        </div>}

        {/* ══ FLEET ══ */}
        {tab==="fleet"&&<div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <input style={s.sInp} placeholder="Search truck # or make..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <select style={s.fSel} value={filterType} onChange={e=>setFilterType(e.target.value)}>
              <option value="all">All Types</option><option value="straight">Straight</option><option value="tractor">Tractors</option>
              <option value="auto">Auto</option><option value="manual">Manual</option><option value="tandem">Tandem</option><option value="single">Single</option>
            </select>
            <div style={s.vTog}><button onClick={()=>setFleetView("tile")} style={fleetView==="tile"?{...s.vBtn,...s.vBtnOn}:s.vBtn}>▦</button><button onClick={()=>setFleetView("list")} style={fleetView==="list"?{...s.vBtn,...s.vBtnOn}:s.vBtn}>☰</button></div>
            <button style={s.addBtn} onClick={()=>setShowAddT(true)}>+ Add</button>
          </div>
          {showAddT&&<div style={s.addForm}>
            <input style={s.fInp} placeholder="Truck #" value={newT.id} onChange={e=>setNewT({...newT,id:e.target.value})}/>
            <div style={{display:"flex",gap:6}}>
              <select style={s.fInp} value={newT.type} onChange={e=>setNewT({...newT,type:e.target.value})}><option value="straight">Straight</option><option value="tractor">Tractor</option></select>
              <select style={s.fInp} value={newT.mk} onChange={e=>setNewT({...newT,mk:e.target.value})}><option value="FRTLN">FRTLN</option><option value="HINO">HINO</option><option value="INTL">INTL</option><option value="Ford">Ford</option><option value="Tractor">Tractor</option></select>
            </div>
            <div style={{display:"flex",gap:6}}>
              <select style={s.fInp} value={newT.tr} onChange={e=>setNewT({...newT,tr:e.target.value})}><option value="A">Auto</option><option value="M">Manual</option></select>
              <select style={s.fInp} value={newT.ax} onChange={e=>setNewT({...newT,ax:e.target.value})}><option value="Single">Single</option><option value="Tandem">Tandem</option></select>
            </div>
            <div style={{display:"flex",gap:8}}><button style={s.saveBtn} onClick={addTruck}>Save</button><button style={s.canBtn} onClick={()=>setShowAddT(false)}>Cancel</button></div>
          </div>}
          {fleetView==="tile"&&<div style={s.cardGrid}>{filteredTrucks.map(t=>{
            const st2=gTS(t.id,dk);const dr=findDriverForTruck(t.id);const openR=repairs.filter(r=>r.truckId===t.id&&r.status==="open");const totalR=repairs.filter(r=>r.truckId===t.id).length;
            return <div key={t.id} style={s.tCard}><div style={s.cHdr}><span style={{...s.tNum,cursor:"pointer",textDecoration:"underline",textDecorationColor:C.brand+"44"}} onClick={()=>setHistoryTruck(t.id)}>#{t.id}</span><span style={{...s.sBdg,background:SC[st2]+"18",color:SC[st2],borderColor:SC[st2]}}>{SL[st2]}</span></div>
              <div style={s.cBody}><Row l="Type" v={t.type==="straight"?"Box Truck":"Tractor"}/><Row l="Make" v={t.mk}/>
                <Row l="Trans" v={<span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:3,background:t.tr==="A"?"#27ae6018":"#e6a81718",color:t.tr==="A"?C.green:C.accent}}>{t.tr==="A"?"AUTO":"MANUAL"}</span>}/>
                <Row l="Axle" v={t.ax}/>{dr&&<Row l="Driver" v={<span style={{color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setDriverReport(dr.name)}>{dr.name}</span>}/>}
                {openR.length>0&&<Row l="Repairs" v={<span style={{color:C.red,fontWeight:700}}>{openR.length} open</span>}/>}
                {totalR>0&&<div style={{marginTop:4}}><button onClick={()=>setHistoryTruck(t.id)} style={{fontSize:10,color:C.brand,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",padding:0}}>View history ({totalR})</button></div>}
              </div>
              <button style={s.remBtn} onClick={()=>removeTruck(t.id)}>Remove</button></div>;
          })}</div>}
          {fleetView==="list"&&<div style={s.tWrap}><table style={{...s.table,fontSize:12}}><thead><tr>{["Truck #","Type","Make","Trans","Axle","Status","Driver","Repairs",""].map(h=><th key={h} style={{...s.th,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead><tbody>
            {filteredTrucks.map(t=>{const st2=gTS(t.id,dk);const dr=findDriverForTruck(t.id);const openR=repairs.filter(r=>r.truckId===t.id&&r.status==="open").length;
              return <tr key={t.id} style={s.tr}><td style={{...s.ltd,fontWeight:700,fontFamily:"monospace",color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setHistoryTruck(t.id)}>{t.id}</td><td style={s.ltd}>{t.type==="straight"?"Box":"Tractor"}</td><td style={s.ltd}>{t.mk}</td>
                <td style={s.ltd}><span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:t.tr==="A"?"#27ae6018":"#e6a81718",color:t.tr==="A"?C.green:C.accent}}>{t.tr==="A"?"A":"M"}</span></td>
                <td style={s.ltd}>{t.ax}</td><td style={s.ltd}><span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,background:SC[st2]+"18",color:SC[st2]}}>{SL[st2]}</span></td>
                <td style={{...s.ltd,color:C.brand,cursor:dr?"pointer":"default",textDecoration:dr?"underline":"none"}} onClick={()=>{if(dr)setDriverReport(dr.name);}}>{dr?dr.name:"—"}</td>
                <td style={s.ltd}>{openR>0?<span style={{color:C.red,fontWeight:700}}>{openR}</span>:"—"}</td>
                <td style={s.ltd}><button style={s.xBtn} onClick={()=>removeTruck(t.id)}>×</button></td></tr>;
            })}</tbody></table></div>}

          {/* Retired Trucks */}
          {retiredTrucks.length>0&&<div style={{marginTop:20}}>
            <div style={s.secT}>🗄️ Retired Trucks ({retiredTrucks.length})</div>
            <div style={{fontSize:12,color:"#6b7785",marginBottom:8}}>Trucks no longer in active fleet but with historical cost data. Auto-detected from bulk imports.</div>
            {retiredTrucks.map(rt=>{
              const rtCosts=costEntries.filter(c=>c.truckId===rt.id);
              const rtTotal=rtCosts.reduce((s,c)=>s+(c.total||0),0);
              const rtCount=rtCosts.length;
              const dates=rtCosts.map(c=>c.date).filter(Boolean).sort();
              return <div key={rt.id} style={{padding:"10px 12px",background:"#fafbfc",border:"1px solid #e2e8f0",borderRadius:6,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.dark,fontFamily:"monospace"}}>#{rt.id}</div>
                  <div style={{fontSize:10,color:"#6b7785"}}>{rtCount} invoice{rtCount!==1?"s":""} · ${rtTotal.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} total{dates.length>0?` · ${dates[0]} → ${dates[dates.length-1]}`:""}</div>
                  {rt.reason&&<div style={{fontSize:10,color:"#94a3b8",fontStyle:"italic"}}>{rt.reason}</div>}
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{
                    if(!confirm(`Restore truck ${rt.id} to active fleet?`))return;
                    saveTrucks([...trucks,{id:rt.id,mk:rt.mk||"FRTLN",tr:"A",ax:"Single",type:"straight"}]);
                    saveRetiredTrucks(retiredTrucks.filter(x=>x.id!==rt.id));
                  }} style={{fontSize:10,padding:"4px 8px",background:"#fff",color:C.green,border:`1px solid ${C.green}`,borderRadius:4,cursor:"pointer",fontWeight:600}}>Restore</button>
                  <button onClick={()=>{
                    if(!confirm(`Permanently delete truck ${rt.id} from retired list? Cost history will be preserved but this truck will no longer appear.`))return;
                    saveRetiredTrucks(retiredTrucks.filter(x=>x.id!==rt.id));
                  }} style={{fontSize:10,padding:"4px 8px",background:"#fff",color:C.red,border:`1px solid ${C.red}`,borderRadius:4,cursor:"pointer",fontWeight:600}}>Delete</button>
                </div>
              </div>;
            })}
          </div>}
        </div>}

        {/* ══ MAINTENANCE ══ */}
        {tab==="maint"&&<div>
          <div style={s.secT}>Open Repairs ({repairs.filter(r=>r.status==="open").length})</div>
          {repairs.filter(r=>r.status==="open").length===0&&<div style={s.emptyMsg}>No open repairs. All trucks operational.</div>}
          {repairs.filter(r=>r.status==="open").map(r=>{
            const t=trucks.find(x=>x.id===r.truckId);
            return <div key={r.id} style={s.repairCard}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><span style={{fontFamily:"monospace",fontWeight:700,fontSize:16,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setHistoryTruck(r.truckId)}>#{r.truckId}</span>{t&&<span style={{fontSize:11,color:"#6b7785",marginLeft:8}}>{t.type==="straight"?t.mk:"Tractor"} · {t.tr==="A"?"Auto":"Man"}</span>}</div>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,background:C.red+"18",color:C.red}}>{r.reason}</span>
              </div>
              {r.notes&&<div style={{fontSize:12,color:"#334155",marginTop:6}}>{r.notes}</div>}
              <div style={{display:"flex",gap:16,marginTop:6,fontSize:11,color:"#6b7785"}}>
                {r.shop&&<span>Shop: {r.shop}</span>}
                <span>In: {dateStr(r.dateIn)}</span>
                {r.estReturn&&<span>Est: {dateStr(r.estReturn)}</span>}
                {r.cost>0&&<span>Cost: ${r.cost.toLocaleString()}</span>}
              </div>
              <div style={{marginTop:8,display:"flex",gap:8}}>
                <button onClick={()=>{const cost=prompt("Final cost (or leave blank):",r.cost||"");closeRepair(r.id,cost?Number(cost):r.cost);}} style={s.closeRepBtn}>Repair Completed</button>
              </div>
            </div>;
          })}

          <div style={{marginTop:24,...s.secT}}>Log New Repair</div>
          <div style={s.addForm}>
            <select style={s.fInp} value={showRepairForm||""} onChange={e=>setShowRepairForm(e.target.value||null)}>
              <option value="">Select Truck...</option>
              {trucks.map(t=><option key={t.id} value={t.id}>#{t.id} — {t.type==="straight"?t.mk:"Tractor"}</option>)}
            </select>
            {showRepairForm&&<>
              <select style={s.fInp} value={repairForm.reason} onChange={e=>setRepairForm({...repairForm,reason:e.target.value})}>
                {OOS_REASONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
              <input style={s.fInp} placeholder="Notes (what's wrong)" value={repairForm.notes} onChange={e=>setRepairForm({...repairForm,notes:e.target.value})}/>
              <input style={s.fInp} placeholder="Shop / Location" value={repairForm.shop} onChange={e=>setRepairForm({...repairForm,shop:e.target.value})}/>
              <div style={{display:"flex",gap:6}}>
                <input style={s.fInp} type="date" placeholder="Est Return" value={repairForm.estReturn} onChange={e=>setRepairForm({...repairForm,estReturn:e.target.value})}/>
                <input style={s.fInp} type="number" placeholder="Cost $" value={repairForm.cost} onChange={e=>setRepairForm({...repairForm,cost:e.target.value})}/>
              </div>
              <button style={s.saveBtn} onClick={()=>addRepair(showRepairForm)}>Log Repair</button>
            </>}
          </div>

          <div style={{marginTop:24,...s.secT}}>Repair History</div>
          <input style={{...s.sInp,marginBottom:12}} placeholder="Filter by truck #..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {repairs.filter(r=>!search||r.truckId.includes(search)).sort((a,b)=>b.id-a.id).map(r=>{
            const t=trucks.find(x=>x.id===r.truckId);
            return <div key={r.id} style={{...s.repairCard,opacity:r.status==="closed"?0.7:1,borderLeftColor:r.status==="open"?C.red:C.green}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><span style={{fontFamily:"monospace",fontWeight:700,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setHistoryTruck(r.truckId)}>#{r.truckId}</span><span style={{fontSize:11,color:"#6b7785",marginLeft:8}}>{r.reason}</span></div>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:r.status==="open"?C.red+"18":C.green+"18",color:r.status==="open"?C.red:C.green}}>{r.status==="open"?"OPEN":"CLOSED"}</span>
              </div>
              {r.notes&&<div style={{fontSize:11,color:"#6b7785",marginTop:4}}>{r.notes}</div>}
              <div style={{fontSize:10,color:"#94a3b8",marginTop:4}}>
                In: {dateStr(r.dateIn)}{r.dateClosed&&` · Resolved: ${dateStr(r.dateClosed)}`}{r.cost>0&&` · $${r.cost.toLocaleString()}`}{r.shop&&` · ${r.shop}`}
              </div>
            </div>;
          })}
        </div>}

        {/* ══ DRIVERS ══ */}
        {tab==="drivers"&&<div>
          <div style={{display:"flex",gap:8,marginBottom:12}}><input style={s.sInp} placeholder="Search driver..." value={search} onChange={e=>setSearch(e.target.value)}/><button style={s.addBtn} onClick={()=>setShowAddD(true)}>+ Add</button></div>
          {showAddD&&<div style={s.addForm}>
            <input style={s.fInp} placeholder="Driver Name" value={newD.name} onChange={e=>setNewD({...newD,name:e.target.value})}/>
            <select style={s.fInp} value={newD.role} onChange={e=>setNewD({...newD,role:e.target.value,category:e.target.value.includes("Owner")?"Owner":"Davis"})}>
              <option value="Davis Straight Driver">Davis Straight Driver</option><option value="Davis Tractor Driver">Davis Tractor Driver</option>
              <option value="Uline Shuttle Driver">Uline Shuttle</option><option value="Load/Shift Driver">Load/Shift</option>
              <option value="Owner Straight Driver">Owner Straight</option><option value="Owner Tractor Driver">Owner Tractor</option>
            </select>
            <div style={{display:"flex",gap:8}}><button style={s.saveBtn} onClick={addDriver}>Save</button><button style={s.canBtn} onClick={()=>setShowAddD(false)}>Cancel</button></div>
          </div>}
          {RG.map(g=>{const fl=drivers.filter(d=>g.f(d)&&(!search||d.name.toLowerCase().includes(search.toLowerCase())));if(!fl.length)return null;
            return <div key={g.key}><div style={{...s.dCat,color:g.color}}>{g.label} ({fl.length})</div>
              {fl.map(d=>{const tv=asgn[`${d.name}-${dk}`]||"";
                return <div key={d.name} style={s.dRow}><div><div style={{...s.dNm,cursor:"pointer",color:C.brand,textDecoration:"underline",textDecorationColor:C.brand+"44"}} onClick={()=>setDriverReport(d.name)}>{drvIcon(d.role)} {d.name}</div><div style={s.dRl}>{d.role}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {tv&&!OFF_OPTS.includes(tv)?<span style={s.tBdg}>#{tv}</span>:OFF_OPTS.includes(tv)?<span style={s.oBdg}>{tv}</span>:null}
                    <button style={s.xBtn} onClick={()=>removeDriver(d.name)}>×</button>
                  </div></div>;
              })}</div>;
          })}
        </div>}

        {/* ══ ATTENDANCE ══ */}
        {tab==="attend"&&(()=>{
          const toggleSort=(col)=>{
            if(attendSort.col===col){
              if(attendSort.dir==="desc")setAttendSort({col,dir:"asc"});
              else setAttendSort({col:null,dir:"desc"});
            }else setAttendSort({col,dir:"desc"});
          };
          const arrow=(col)=>attendSort.col!==col?<span style={{color:"#cbd5e1",marginLeft:3,fontSize:9}}>↕</span>:attendSort.dir==="desc"?<span style={{color:C.brand,marginLeft:3,fontSize:9}}>▼</span>:<span style={{color:C.brand,marginLeft:3,fontSize:9}}>▲</span>;
          const hBtn={cursor:"pointer",userSelect:"none"};
          const sortedDrivers=(()=>{
            if(!attendSort.col)return null;
            const withStats=drivers.map(d=>{
              const a=attendance[d.name]||{worked:0,off:0,vac:0,calledOut:0,noShow:0,unassigned:0,totalDays:0};
              const scheduledDays=a.totalDays-a.vac;
              const rate=scheduledDays>0?Math.round((a.worked/scheduledDays)*100):0;
              return{...d,a,rate};
            });
            const getVal=(d)=>{
              switch(attendSort.col){
                case"driver":return d.name.toLowerCase();
                case"worked":return d.a.worked;
                case"off":return d.a.off;
                case"vac":return d.a.vac;
                case"calledOut":return d.a.calledOut;
                case"noShow":return d.a.noShow;
                case"unassigned":return d.a.unassigned;
                case"rate":return d.rate;
                default:return 0;
              }
            };
            withStats.sort((x,y)=>{
              const vx=getVal(x),vy=getVal(y);
              if(vx<vy)return attendSort.dir==="desc"?1:-1;
              if(vx>vy)return attendSort.dir==="desc"?-1:1;
              return 0;
            });
            return withStats;
          })();
          return <div>
          <div style={s.secT}>Driver Attendance — Last {Object.keys(attendWeeks).length} Weeks</div>
          <div style={{fontSize:11,color:"#6b7785",marginBottom:12}}>Click column headers to sort. {attendSort.col?<button onClick={()=>setAttendSort({col:null,dir:"desc"})} style={{marginLeft:6,fontSize:10,padding:"2px 8px",background:"#fff",color:C.brand,border:`1px solid ${C.brand}55`,borderRadius:4,cursor:"pointer"}}>Clear sort (group by role)</button>:null}</div>
          <div style={s.tWrap}><table style={{...s.table,fontSize:11}}><thead><tr>
            <th style={{...s.th,minWidth:120,...hBtn}} onClick={()=>toggleSort("driver")}>Driver{arrow("driver")}</th>
            <th style={{...s.th,...hBtn}} onClick={()=>toggleSort("worked")}>Worked{arrow("worked")}</th>
            <th style={{...s.th,...hBtn}} onClick={()=>toggleSort("off")}>Off{arrow("off")}</th>
            <th style={{...s.th,...hBtn}} onClick={()=>toggleSort("vac")}>Vac{arrow("vac")}</th>
            <th style={{...s.th,color:C.red,...hBtn}} onClick={()=>toggleSort("calledOut")}>Called Out{arrow("calledOut")}</th>
            <th style={{...s.th,color:C.red,...hBtn}} onClick={()=>toggleSort("noShow")}>No Show{arrow("noShow")}</th>
            <th style={{...s.th,...hBtn}} onClick={()=>toggleSort("unassigned")}>Unassigned{arrow("unassigned")}</th>
            <th style={{...s.th,...hBtn}} onClick={()=>toggleSort("rate")}>Rate{arrow("rate")}</th>
          </tr></thead><tbody>
            {sortedDrivers?sortedDrivers.map(d=>{
              const a=d.a;const rate=d.rate;
              const isBad=a.calledOut>=3||a.noShow>=1||rate<70;
              return <tr key={d.name} style={{...s.tr,background:isBad?"#fef2f2":"transparent"}}>
                <td style={{...s.td,fontWeight:600,color:C.brand,cursor:"pointer",textDecoration:"underline",textDecorationColor:C.brand+"44"}} onClick={()=>setDriverReport(d.name)}>{d.name}</td>
                <td style={{...s.td,color:C.green,fontWeight:700}}>{a.worked}</td>
                <td style={s.td}>{a.off}</td><td style={s.td}>{a.vac}</td>
                <td style={{...s.td,color:a.calledOut>=3?C.red:"inherit",fontWeight:a.calledOut>=3?700:400}}>{a.calledOut}</td>
                <td style={{...s.td,color:a.noShow>=1?C.red:"inherit",fontWeight:a.noShow>=1?700:400}}>{a.noShow}</td>
                <td style={s.td}>{a.unassigned}</td>
                <td style={{...s.td,fontWeight:700,color:rate>=90?C.green:rate>=70?C.accent:C.red}}>{rate}%</td>
              </tr>;
            }):RG.map(g=>{
              const gd=drivers.filter(g.f);if(!gd.length)return null;
              return[
                <tr key={`ah-${g.key}`}><td colSpan={8} style={{...s.roleDiv,color:g.color}}>{g.label}</td></tr>,
                ...gd.map(d=>{
                  const a=attendance[d.name]||{worked:0,off:0,vac:0,calledOut:0,noShow:0,unassigned:0,totalDays:0};
                  const scheduledDays=a.totalDays-a.vac;
                  const rate=scheduledDays>0?Math.round((a.worked/scheduledDays)*100):0;
                  const isBad=a.calledOut>=3||a.noShow>=1||rate<70;
                  return <tr key={d.name} style={{...s.tr,background:isBad?"#fef2f2":"transparent"}}>
                    <td style={{...s.td,fontWeight:600,color:C.brand,cursor:"pointer",textDecoration:"underline",textDecorationColor:C.brand+"44"}} onClick={()=>setDriverReport(d.name)}>{d.name}</td>
                    <td style={{...s.td,color:C.green,fontWeight:700}}>{a.worked}</td>
                    <td style={s.td}>{a.off}</td><td style={s.td}>{a.vac}</td>
                    <td style={{...s.td,color:a.calledOut>=3?C.red:"inherit",fontWeight:a.calledOut>=3?700:400}}>{a.calledOut}</td>
                    <td style={{...s.td,color:a.noShow>=1?C.red:"inherit",fontWeight:a.noShow>=1?700:400}}>{a.noShow}</td>
                    <td style={s.td}>{a.unassigned}</td>
                    <td style={{...s.td,fontWeight:700,color:rate>=90?C.green:rate>=70?C.accent:C.red}}>{rate}%</td>
                  </tr>;
                })
              ];
            })}
          </tbody></table></div>
        </div>;
        })()}

        {/* ══ COSTS / INVOICE SCANNER ══ */}
        {tab==="costs"&&<div>
          {/* Scanner section */}
          {/* Gmail Vendors */}
          <div style={{background:"#fff",borderRadius:8,padding:14,marginBottom:16,border:"1px solid #e2e8f0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>📧 Known Invoice Vendors</div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{
                  const groups={};
                  costEntries.forEach(c=>{
                    const norm=normalizeVendor(c.vendor);
                    if(!groups[norm])groups[norm]=[];
                    groups[norm].push(c.vendor);
                  });
                  const dupes=Object.entries(groups).filter(([,vs])=>new Set(vs).size>1);
                  if(dupes.length===0){alert("No duplicate vendors found.");return;}
                  const msg="Found duplicate vendor names that will be merged:\n\n"+dupes.map(([norm,vs])=>`• ${norm}\n   was: ${[...new Set(vs)].join(", ")}`).join("\n\n")+"\n\nMerge them all?";
                  if(!confirm(msg))return;
                  const merged=costEntries.map(c=>({...c,vendor:normalizeVendor(c.vendor)}));
                  saveCosts(merged);
                  alert(`Merged ${dupes.length} vendor group${dupes.length>1?"s":""}.`);
                }} style={{fontSize:11,fontWeight:600,color:C.accent,background:"none",border:`1px solid ${C.accent}44`,borderRadius:4,padding:"3px 8px",cursor:"pointer"}}>🔀 Merge Duplicates</button>
                <button onClick={()=>setShowAddVendor(!showAddVendor)} style={{fontSize:11,fontWeight:600,color:C.brand,background:"none",border:`1px solid ${C.brand}44`,borderRadius:4,padding:"3px 8px",cursor:"pointer"}}>+ Add Vendor</button>
              </div>
            </div>
            <div style={{fontSize:11,color:"#6b7785",marginBottom:8}}>Vendors who send truck-related invoices. Download their PDF attachments from Gmail and upload below.</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {knownVendors.map(v=><span key={v.name} style={{fontSize:11,padding:"4px 10px",background:C.light,color:C.dark,borderRadius:5,fontWeight:600,border:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:6}}>
                {v.name} <span style={{color:"#94a3b8"}}>({v.category})</span>
                <button onClick={()=>removeVendor(v.name)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>×</button>
              </span>)}
              {knownVendors.length===0&&<span style={{fontSize:11,color:"#94a3b8"}}>No vendors added yet.</span>}
            </div>
            {showAddVendor&&<div style={{display:"flex",gap:6,marginTop:8}}>
              <input style={{...s.fInp,flex:1}} placeholder="Vendor name" value={newVendor.name} onChange={e=>setNewVendor({...newVendor,name:e.target.value})}/>
              <select style={s.fInp} value={newVendor.category} onChange={e=>setNewVendor({...newVendor,category:e.target.value})}>
                {COST_CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addVendor} style={{...s.saveBtn,padding:"6px 12px",fontSize:11}}>Add</button>
            </div>}
          </div>

          <div style={s.secT}>Fetch Invoices from Gmail</div>
          <div style={{...s.addForm,marginBottom:16}}>
            {!gmailConn?<div>
              <div style={{fontSize:12,color:"#6b7785",marginBottom:10}}>Connect your Gmail account to search for vendor invoices. Read-only access — the app only searches, never sends or deletes.</div>
              <a href="/api/gmail-auth" style={{display:"inline-block",padding:"10px 18px",fontSize:13,fontWeight:700,background:"#1a73e8",color:"#fff",textDecoration:"none",borderRadius:6}}>🔗 Connect Gmail</a>
            </div>:<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:12,color:"#6b7785"}}>Connected: <span style={{color:C.green,fontWeight:700}}>✓ {gmailConn.email}</span></div>
                <button onClick={disconnectGmail} style={{fontSize:10,padding:"3px 8px",background:"none",color:C.red,border:`1px solid ${C.red}44`,borderRadius:4,cursor:"pointer"}}>Disconnect</button>
              </div>
              <div style={{fontSize:12,color:"#6b7785",marginBottom:8}}>Search your email for vendor invoices (last year). Results include attachment info.</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {knownVendors.map(v=><button key={v.name} onClick={()=>fetchGmailInvoices(v.name.toLowerCase())} disabled={gmailLoading} style={{...s.saveBtn,opacity:gmailLoading?0.5:1,fontSize:12,padding:"6px 12px"}}>{gmailLoading?"Searching...":"📧 "+v.name}</button>)}
              </div>
            </div>}
            {gmailResults&&Array.isArray(gmailResults)&&(()=>{
              // Build a set of invoice numbers already in costEntries (for fallback dedup)
              // against filenames of emails that came in before Gmail integration
              const existingInvNums=new Set(costEntries.filter(c=>c.invoiceNum).map(c=>String(c.invoiceNum).toUpperCase()));
              // Normalize a filename → candidate invoice#: strip extension, _pageSuffix, spaces
              const filenameToInvCandidates=(fn)=>{
                if(!fn)return [];
                const base=fn.replace(/\.[^.]+$/,"").replace(/_\d+$/,"").trim();
                const candidates=[base.toUpperCase()];
                // Also try stripped-of-prefix (e.g. CPB35554 → 35554)
                const numMatch=base.match(/\d+$/);
                if(numMatch)candidates.push(numMatch[0]);
                return candidates;
              };
              const attIsImported=(r,a)=>{
                const tag=`gmail:${r.emailId}:${a.attachmentId}`;
                if(costEntries.some(c=>c.gmailRef===tag))return true;
                // Fallback: if filename matches an existing invoice number
                const cands=filenameToInvCandidates(a.filename);
                return cands.some(c=>existingInvNums.has(c));
              };
              // Classify each email: "fully imported" means all scannable attachments already exist as cost entries
              const emailStatus=gmailResults.map(r=>{
                if(!r||r.error)return {fullyImported:false,dismissed:false};
                const dismissed=!!dismissedMsgs[r.emailId];
                const atts=Array.isArray(r.attachments)?r.attachments:[];
                const scannableAtts=atts.filter(a=>a&&a.attachmentId&&(a.mimeType==="application/pdf"||(a.filename||"").toLowerCase().endsWith(".pdf")||(a.mimeType||"").startsWith("image/")));
                if(scannableAtts.length===0)return {fullyImported:false,dismissed};
                const allImported=scannableAtts.every(a=>attIsImported(r,a));
                return {fullyImported:allImported,dismissed};
              });
              const fullyImportedCount=emailStatus.filter(s=>s.fullyImported).length;
              const dismissedCount=emailStatus.filter(s=>s.dismissed).length;
              const hiddenCount=emailStatus.filter(s=>s.fullyImported||s.dismissed).length;
              const visibleResults=showImportedEmails?gmailResults:gmailResults.filter((_,i)=>!emailStatus[i].fullyImported&&!emailStatus[i].dismissed);
              return <div style={{marginTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:6}}>
                <div style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>
                  {visibleResults.length} email{visibleResults.length!==1?"s":""} {showImportedEmails?"total":"new"}
                  {hiddenCount>0&&!showImportedEmails&&<span style={{fontSize:10,color:"#94a3b8",fontWeight:400,marginLeft:6}}>({fullyImportedCount} imported, {dismissedCount} dismissed hidden)</span>}
                </div>
                {hiddenCount>0&&<button onClick={()=>setShowImportedEmails(!showImportedEmails)} style={{fontSize:10,fontWeight:600,padding:"3px 8px",background:"#fff",color:C.brand,border:`1px solid ${C.brand}55`,borderRadius:4,cursor:"pointer"}}>{showImportedEmails?"Hide imported/dismissed":`Show all (${gmailResults.length})`}</button>}
                {(()=>{
                  // Count how many attachments are scannable and NOT already imported/queued/dismissed
                  const queueable=[];
                  visibleResults.forEach(r=>{
                    if(!r||r.error)return;
                    if(dismissedMsgs[r.emailId])return;
                    const atts=Array.isArray(r.attachments)?r.attachments:[];
                    atts.forEach(a=>{
                      if(!a||!a.attachmentId)return;
                      const canScan=a.mimeType==="application/pdf"||(a.filename||"").toLowerCase().endsWith(".pdf")||(a.mimeType||"").startsWith("image/");
                      if(!canScan)return;
                      if(attIsImported(r,a))return;
                      if(scanQueue.some(q=>q.gmailRef===`gmail:${r.emailId}:${a.attachmentId}`))return;
                      queueable.push({r,a});
                    });
                  });
                  if(queueable.length===0)return null;
                  return <button onClick={async()=>{
                    for(const {r,a} of queueable){
                      await processGmailAttachment(r,a);
                    }
                  }} disabled={gmailProcessing!==null} style={{fontSize:11,fontWeight:700,padding:"4px 10px",background:C.brand,color:"#fff",border:"none",borderRadius:4,cursor:gmailProcessing?"wait":"pointer",opacity:gmailProcessing?0.5:1}}>{gmailProcessing?"Processing...":`⇣ Queue All (${queueable.length})`}</button>;
                })()}
              </div>
              {visibleResults.map((r,i)=>{
                const safeR=(r&&typeof r==="object")?r:{error:String(r)};
                const atts=Array.isArray(safeR.attachments)?safeR.attachments:[];
                const isProcessing=gmailProcessing===safeR.emailId;
                // × button persistently dismisses — email won't appear in future searches
                const dismiss=()=>{
                  if(safeR.emailId)dismissGmailMsg(safeR.emailId,{subject:safeR.emailSubject,date:safeR.emailDate});
                  setGmailResults(prev=>prev.filter(item=>item.emailId!==safeR.emailId));
                };
                return <div key={safeR.emailId||i} style={{padding:"8px 10px",background:safeR.error?"#fef2f2":"#f0f9ff",borderRadius:6,marginBottom:4,border:"1px solid #e2e8f0"}}>
                  {safeR.error?<div style={{fontSize:11,color:C.red,wordBreak:"break-word"}}>{typeof safeR.error==="string"?safeR.error:JSON.stringify(safeR.error).substring(0,500)}</div>:<div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{safeR.emailSubject||"No subject"}</div>
                        <div style={{fontSize:10,color:"#6b7785"}}>{safeR.emailDate||""} · From: {safeR.from||""}</div>
                        {safeR.snippet&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2,fontStyle:"italic"}}>{safeR.snippet.substring(0,120)}{safeR.snippet.length>120?"...":""}</div>}
                      </div>
                      <button onClick={dismiss} title="Dismiss — won't show in future searches" style={{fontSize:14,padding:"2px 8px",background:"none",color:"#94a3b8",border:"none",cursor:"pointer",fontWeight:700,lineHeight:1}}>×</button>
                    </div>
                    {atts.length>0&&<div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}}>
                      {atts.map((a,ai)=>{
                        const gmailTag=`gmail:${safeR.emailId}:${a.attachmentId}`;
                        const alreadyImported=attIsImported(safeR,a);
                        const alreadyQueued=scanQueue.some(q=>q.gmailRef===gmailTag);
                        const canScan=a.attachmentId&&(a.mimeType==="application/pdf"||(a.filename||"").toLowerCase().endsWith(".pdf")||(a.mimeType||"").startsWith("image/"));
                        return <div key={ai} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
                          <span style={{fontSize:10,color:C.brand,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📎 {a.filename||"file"} ({a.size?Math.round(a.size/1024)+"KB":"?"})</span>
                          {alreadyImported?<span style={{fontSize:9,fontWeight:700,padding:"3px 8px",background:"#f1f5f9",color:"#94a3b8",borderRadius:4,whiteSpace:"nowrap"}}>✓ Imported</span>
                            :alreadyQueued?<span style={{fontSize:9,fontWeight:700,padding:"3px 8px",background:"#fef3c7",color:C.accent,borderRadius:4,whiteSpace:"nowrap"}}>In Queue</span>
                            :canScan?<button onClick={()=>processGmailAttachment(safeR,a)} disabled={isProcessing} style={{fontSize:9,fontWeight:700,padding:"3px 8px",background:C.green,color:"#fff",border:"none",borderRadius:4,cursor:isProcessing?"wait":"pointer",opacity:isProcessing?0.5:1,whiteSpace:"nowrap"}}>{isProcessing?"...":"→ Scan"}</button>
                            :null}
                        </div>;
                      })}
                    </div>}
                  </div>}
                </div>;
              })}
              {visibleResults.length===0&&<div style={{padding:20,textAlign:"center",color:"#94a3b8",fontSize:12,fontStyle:"italic"}}>No new emails — all results already imported or dismissed. ✓</div>}
              <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                <button onClick={()=>setGmailResults(null)} style={{...s.canBtn,fontSize:11,flex:1}}>Dismiss All Results</button>
                {Object.keys(dismissedMsgs).length>0&&<button onClick={clearAllDismissed} title={`${Object.keys(dismissedMsgs).length} emails dismissed. Click to reset.`} style={{...s.canBtn,fontSize:11,background:"#fff",color:"#94a3b8",border:"1px solid #e2e8f0"}}>Clear dismissed ({Object.keys(dismissedMsgs).length})</button>}
              </div>
            </div>;
            })()}
          </div>

          <div style={s.secT}>Invoice Scanner</div>
          <div style={{...s.addForm,marginBottom:16}}>
            <div style={{fontSize:12,color:"#6b7785",marginBottom:4}}>Upload scanned invoices (PDF or images). AI will read each one and extract truck #, vendor, amount, and details automatically.</div>
            <input type="file" accept="image/*,application/pdf" multiple onChange={handleFileUpload} style={{fontSize:13,padding:8}}/>
            {scanQueue.length>0&&<div>
              <div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginTop:8,marginBottom:6}}>{scanQueue.length} invoice{scanQueue.length>1?"s":""} queued</div>
              {scanQueue.filter(q=>q.status!=="merged").map((q,i)=>{const isDup=q.status==="parsed"&&q.parsed&&q.parsed.invoiceNum&&costEntries.some(c=>c.invoiceNum===q.parsed.invoiceNum);
                const currentTruck=q.parsed?.truckId||"";
                const isInventory=currentTruck==="INVENTORY";
                const truckOk=currentTruck&&currentTruck!=="UNKNOWN";
                return <div key={q.id} style={{padding:"8px 10px",background:isDup?"#fef3c7":q.status==="parsed"?"#f0fdf4":q.status==="error"?"#fef2f2":q.status==="uploading"?"#fffbeb":"#f8fafc",borderRadius:6,marginBottom:6,border:"1px solid #e2e8f0"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#1e293b",wordBreak:"break-word"}}>{q.file}</div>
                      {q.status==="parsed"&&q.parsed&&!q.parsed.error&&<div style={{fontSize:10,color:isDup?C.accent:C.green,marginTop:2}}>
                        {isDup?"⚠ DUPLICATE — ":""}{q.parsed.vendor} · ${q.parsed.total?.toLocaleString()||0} · {q.parsed.category}{q.parsed.invoiceNum&&` · Inv #${q.parsed.invoiceNum}`}
                        {q.parsed.gallons&&q.parsed.pricePerGallon&&<div style={{fontSize:10,color:C.brand,fontWeight:700,marginTop:2}}>⛽ {q.parsed.gallons} gal @ ${Number(q.parsed.pricePerGallon).toFixed(4)}/gal</div>}
                      </div>}
                      {q.status==="error"&&<div style={{fontSize:10,color:C.red}}>Error: {q.parsed?.error||"Failed"}</div>}
                      {q.status==="scanning"&&<div style={{fontSize:10,color:C.brand}}>Scanning...</div>}
                      {q.status==="waiting"&&<div style={{fontSize:10,color:C.accent,fontWeight:700}}>⏳ {q.parsed?._waitMsg||"Waiting..."}</div>}
                      {q.status==="uploading"&&<div style={{fontSize:10,color:C.accent,fontWeight:700}}>💾 Saving PDF...</div>}
                      {q.status==="ready"&&<div style={{fontSize:10,color:"#94a3b8"}}>Ready to scan</div>}
                    </div>
                    <div style={{display:"flex",gap:4,alignItems:"center"}}>
                      {q.dataUrl&&<button onClick={()=>setScanPreview(q)} title="Preview" style={{fontSize:11,padding:"3px 8px",background:"#fff",color:C.brand,border:`1px solid ${C.brand}55`,borderRadius:4,cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>👁 View</button>}
                      {q.status==="parsed"&&q.parsed&&!q.parsed.error&&<span style={{fontSize:16,color:isDup?C.accent:C.green}}>{isDup?"⚠":"✓"}</span>}
                      <button onClick={()=>setScanQueue(scanQueue.filter(x=>x.id!==q.id))} style={s.xBtn}>×</button>
                    </div>
                  </div>
                  {q.status==="parsed"&&q.parsed&&!q.parsed.error&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:6,flexWrap:"wrap"}}>
                    <label style={{fontSize:10,fontWeight:700,color:"#6b7785"}}>Truck:</label>
                    <select value={currentTruck} onChange={e=>{
                      const newTruck=e.target.value;
                      setScanQueue(prev=>prev.map(x=>x.id===q.id?{...x,parsed:{...x.parsed,truckId:newTruck||"INVENTORY"}}:x));
                    }} style={{fontSize:11,padding:"3px 6px",border:`1px solid ${truckOk?"#d1d9e0":C.red}`,borderRadius:4,background:isInventory?"#fef3c7":"#fff",color:"#1e293b",minWidth:100,fontWeight:isInventory?600:400}}>
                      <option value="INVENTORY">📦 Inventory (no truck)</option>
                      <option value="">— Select truck —</option>
                      {trucks.map(t=><option key={t.id} value={t.id}>{t.id} {t.type==="tractor"?"(T)":""}</option>)}
                    </select>
                    <label style={{fontSize:10,fontWeight:700,color:"#6b7785"}}>Category:</label>
                    <select value={q.parsed.category||"Other"} onChange={e=>{
                      setScanQueue(prev=>prev.map(x=>x.id===q.id?{...x,parsed:{...x.parsed,category:e.target.value}}:x));
                    }} style={{fontSize:11,padding:"3px 6px",border:"1px solid #d1d9e0",borderRadius:4,background:"#fff",color:"#1e293b"}}>
                      {COST_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>}
                </div>;})}
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                {scanQueue.some(q=>q.status==="ready")&&<button onClick={scanInvoices} disabled={scanning} style={{...s.saveBtn,opacity:scanning?0.6:1}}>{scanning?"Scanning...":"Scan All with AI"}</button>}
                {scanQueue.some(q=>q.status==="parsed")&&<button onClick={confirmScannedInvoices} style={s.addBtn}>Confirm & Save All</button>}
                {scanQueue.some(q=>q.status==="error")&&<button onClick={()=>setScanQueue(prev=>prev.map(q=>q.status==="error"?{...q,status:"ready",parsed:null}:q))} style={{...s.saveBtn,background:C.accent}}>↻ Retry Errors</button>}
                {scanQueue.some(q=>q.status==="error")&&<button onClick={()=>setScanQueue(prev=>prev.filter(q=>q.status!=="error"))} style={s.canBtn}>Clear Errors</button>}
                <button onClick={()=>setScanQueue([])} style={s.canBtn}>Clear Queue</button>
              </div>
            </div>}
          </div>

          {/* Manual entry */}
          <ManualCostForm trucks={trucks} cats={COST_CATS} onAdd={addManualCost}/>

          <div style={s.secT}>Bulk Import Historical Data</div>
          <div style={{...s.addForm,marginBottom:16}}>
            <div style={{fontSize:12,color:"#6b7785",marginBottom:8}}>Upload a JSON file with historical invoice data (from AR statements, QuickBooks exports, etc.). Duplicates by invoice number are automatically skipped.</div>
            <input type="file" accept="application/json,.json" onChange={async(e)=>{
              const f=e.target.files?.[0];if(!f)return;
              try{
                const text=await f.text();
                const data=JSON.parse(text);
                if(!Array.isArray(data)){alert("JSON must be an array of invoice objects");return;}
                const existing=new Set(costEntries.filter(c=>c.invoiceNum).map(c=>c.invoiceNum));
                const activeFleetIds=new Set(trucks.map(t=>t.id));
                const existingRetiredIds=new Set(retiredTrucks.map(t=>t.id));
                const newRetired=new Set();
                const newEntries=[];let skipped=0;
                data.forEach(row=>{
                  if(row.invoiceNum&&existing.has(row.invoiceNum)){skipped++;return;}
                  if(row.invoiceNum&&newEntries.find(n=>n.invoiceNum===row.invoiceNum)){skipped++;return;}
                  // Auto-convert UNKNOWN/null trucks to INVENTORY
                  const isInv=!row.truckId||row.truckId==="UNKNOWN"||row.truckId==="INVENTORY";
                  // Detect retired trucks — in invoices but not in current fleet
                  if(!isInv&&row.truckId&&!activeFleetIds.has(row.truckId)&&!existingRetiredIds.has(row.truckId)){
                    newRetired.add(row.truckId);
                  }
                  newEntries.push({
                    id:Date.now()+Math.random(),
                    truckId:isInv?"INVENTORY":row.truckId,
                    vendor:normalizeVendor(row.vendor),
                    date:row.date||new Date().toISOString().split("T")[0],
                    invoiceNum:row.invoiceNum||null,
                    total:Number(row.total)||0,
                    category:isInv?"Inventory":(row.category||"Parts"),
                    lineItems:row.lineItems||[],
                    notes:row.notes||(row.sourceStmt?`Imported from ${row.sourceStmt}`:"Bulk import"),
                    sourceFile:row.sourceStmt||"bulk-import",
                    allocatedToTruck:null,
                    allocatedDate:null,
                    addedAt:new Date().toISOString(),
                  });
                });
                if(newEntries.length>0){
                  const next=[...newEntries,...costEntries];
                  saveCosts(next);
                }
                if(newRetired.size>0){
                  const retiredList=[...retiredTrucks,...Array.from(newRetired).map(id=>({id,mk:"UNKNOWN",retiredDate:new Date().toISOString().split("T")[0],reason:"Auto-detected from historical invoices"}))];
                  saveRetiredTrucks(retiredList);
                }
                alert(`Imported ${newEntries.length} invoices.\nSkipped ${skipped} duplicates.${newRetired.size>0?`\n\nDetected ${newRetired.size} retired truck${newRetired.size>1?"s":""}: ${Array.from(newRetired).join(", ")}`:""}`);
                e.target.value="";
              }catch(err){alert("Import failed: "+err.message);}
            }} style={{fontSize:13,padding:8}}/>
          </div>

          {/* Inventory Tracking */}
          {inventoryAnalytics.inv.length>0&&<div>
            <div style={{...s.secT,marginTop:20}}>📦 Parts Inventory Tracking</div>
            <div style={s.statGrid}>
              <Stat l="Total Inventory Spend" v={`$${Math.round(inventoryAnalytics.totalSpend).toLocaleString()}`} c={C.brand}/>
              <Stat l="Unallocated (On Shelf)" v={`$${Math.round(inventoryAnalytics.unallocatedValue).toLocaleString()}`} c={C.accent}/>
              <Stat l="Allocated to Trucks" v={`$${Math.round(inventoryAnalytics.allocatedValue).toLocaleString()}`} c={C.green}/>
              <Stat l="Inventory Invoices" v={inventoryAnalytics.inv.length} c={C.dark}/>
            </div>
            <div style={{marginTop:12,fontSize:12,color:"#6b7785"}}>
              Inventory invoices are parts purchased without a specific truck assignment (shelf stock). When you install a part, click "Allocate" to assign it to a truck.
            </div>

            {/* Monthly inventory spend trend */}
            {Object.keys(inventoryAnalytics.byMonth).length>1&&<div style={{marginTop:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginBottom:6}}>Inventory Spend by Month</div>
              <div style={{display:"flex",gap:4,alignItems:"flex-end",height:80,background:"#f8fafc",padding:8,borderRadius:6,border:"1px solid #e2e8f0"}}>
                {Object.entries(inventoryAnalytics.byMonth).sort().map(([m,v])=>{
                  const max=Math.max(...Object.values(inventoryAnalytics.byMonth));
                  const h=Math.max(4,(v/max)*60);
                  return <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{fontSize:8,color:"#6b7785"}}>${Math.round(v/1000)}k</div>
                    <div style={{width:"100%",height:h,background:C.brand,borderRadius:"2px 2px 0 0"}}/>
                    <div style={{fontSize:8,color:"#6b7785"}}>{m.substring(2)}</div>
                  </div>;
                })}
              </div>
            </div>}

            {/* Unallocated inventory list */}
            {inventoryAnalytics.unallocated.length>0&&<div style={{marginTop:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginBottom:6}}>On Shelf — {inventoryAnalytics.unallocated.length} unallocated invoices</div>
              <div style={{maxHeight:240,overflowY:"auto",border:"1px solid #e2e8f0",borderRadius:6}}>
                {inventoryAnalytics.unallocated.sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",borderBottom:"1px solid #f1f5f9",background:"#fff",cursor:"pointer"}} onClick={()=>setShowCostDetail(c)}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#1e293b"}}>{c.date} · {c.invoiceNum||"no inv#"} · ${(c.total||0).toFixed(2)}{c.fileUrl?" · 📄":""}</div>
                    <div style={{fontSize:10,color:"#6b7785",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.vendor}{c.notes?" — "+c.notes:""}</div>
                  </div>
                  <button onClick={(e)=>{e.stopPropagation();setAllocModal(c);}} style={{fontSize:10,padding:"4px 8px",background:C.brand,color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontWeight:600}}>Allocate</button>
                </div>)}
              </div>
            </div>}

            {/* Allocated history */}
            {inventoryAnalytics.allocated.length>0&&<div style={{marginTop:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginBottom:6}}>Allocated to Trucks — {inventoryAnalytics.allocated.length} invoices</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:6}}>
                {Object.entries(inventoryAnalytics.allocByTruck).sort((a,b)=>b[1]-a[1]).map(([t,v])=><div key={t} style={{fontSize:11,padding:"4px 8px",background:"#ecfdf5",color:C.green,borderRadius:4,fontWeight:600}}>Truck {t}: ${v.toFixed(0)}</div>)}
              </div>
              <div style={{maxHeight:160,overflowY:"auto",border:"1px solid #e2e8f0",borderRadius:6}}>
                {inventoryAnalytics.allocated.sort((a,b)=>(b.allocatedDate||"").localeCompare(a.allocatedDate||"")).map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",borderBottom:"1px solid #f1f5f9",background:"#fff",cursor:"pointer"}} onClick={()=>setShowCostDetail(c)}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#1e293b"}}>Truck {c.allocatedToTruck} ← {c.invoiceNum||"no inv#"} · ${(c.total||0).toFixed(2)}{c.fileUrl?" · 📄":""}</div>
                    <div style={{fontSize:10,color:"#6b7785"}}>Purchased {c.date} · Installed {c.allocatedDate}</div>
                  </div>
                  <button onClick={(e)=>{e.stopPropagation();unallocateInventory(c.id);}} style={{fontSize:10,padding:"4px 8px",background:"#fff",color:C.red,border:`1px solid ${C.red}`,borderRadius:4,cursor:"pointer",fontWeight:600}}>Undo</button>
                </div>)}
              </div>
            </div>}
          </div>}

          {/* Allocation modal */}
          {allocModal&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={()=>setAllocModal(null)}>
            <div style={{background:"#fff",borderRadius:10,padding:20,maxWidth:400,width:"100%",maxHeight:"80vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:4}}>Allocate Inventory Part</div>
              <div style={{fontSize:12,color:"#6b7785",marginBottom:12}}>{allocModal.invoiceNum} · ${(allocModal.total||0).toFixed(2)} · {allocModal.vendor}</div>
              <div style={{fontSize:12,fontWeight:600,color:"#1e293b",marginBottom:6}}>Assign to truck:</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,maxHeight:300,overflowY:"auto"}}>
                {trucks.map(t=><button key={t.id} onClick={()=>allocateInventory(allocModal.id,t.id)} style={{fontSize:11,padding:"8px 4px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:4,cursor:"pointer",fontWeight:600}}>{t.id}</button>)}
              </div>
              <button onClick={()=>setAllocModal(null)} style={{marginTop:12,width:"100%",padding:"8px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:6,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>}

          {/* Scan Preview modal */}
          {scanPreview&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100,padding:16}} onClick={()=>setScanPreview(null)}>
            <div style={{background:"#fff",borderRadius:10,maxWidth:900,width:"100%",maxHeight:"95vh",display:"flex",flexDirection:"column",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#f8fafc"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1e293b",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{scanPreview.file}</div>
                <button onClick={()=>setScanPreview(null)} style={{fontSize:18,background:"none",border:"none",color:"#6b7785",cursor:"pointer",padding:"0 8px",fontWeight:700}}>×</button>
              </div>
              <div style={{flex:1,overflow:"auto",padding:12,background:"#f1f5f9",textAlign:"center"}}>
                {scanPreview.dataUrl&&<img src={scanPreview.dataUrl} alt="Preview" style={{maxWidth:"100%",height:"auto",borderRadius:4,boxShadow:"0 2px 10px rgba(0,0,0,0.15)"}}/>}
              </div>
              {scanPreview.parsed&&!scanPreview.parsed.error&&<div style={{padding:"10px 16px",borderTop:"1px solid #e2e8f0",background:"#fff",fontSize:11,color:"#6b7785"}}>
                <strong style={{color:"#1e293b"}}>{scanPreview.parsed.vendor}</strong> · Inv #{scanPreview.parsed.invoiceNum||"?"} · Truck #{scanPreview.parsed.truckId} · ${scanPreview.parsed.total?.toLocaleString()||0}
              </div>}
            </div>
          </div>}
          {showCostDetail&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={()=>setShowCostDetail(null)}>
            <div style={{background:"#fff",borderRadius:10,padding:0,maxWidth:600,width:"100%",maxHeight:"90vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:"16px 20px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:18,fontWeight:700,color:"#1e293b"}}>Invoice Details</div>
                  <div style={{fontSize:11,color:"#6b7785",marginTop:2}}>{showCostDetail.date}{showCostDetail.invoiceNum?` · #${showCostDetail.invoiceNum}`:""}</div>
                </div>
                <button onClick={()=>setShowCostDetail(null)} style={{fontSize:18,background:"none",border:"none",color:"#94a3b8",cursor:"pointer",padding:"0 8px",fontWeight:700}}>×</button>
              </div>
              <div style={{padding:"16px 20px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  <div>
                    <div style={{fontSize:10,color:"#6b7785",fontWeight:700,textTransform:"uppercase"}}>Vendor</div>
                    <div style={{fontSize:13,color:"#1e293b",fontWeight:600,marginTop:2}}>{showCostDetail.vendor||"—"}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"#6b7785",fontWeight:700,textTransform:"uppercase"}}>Total</div>
                    <div style={{fontSize:16,color:C.red,fontWeight:800,marginTop:2}}>${(showCostDetail.total||0).toLocaleString(undefined,{minimumFractionDigits:2})}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"#6b7785",fontWeight:700,textTransform:"uppercase"}}>Truck #</div>
                    <div style={{fontSize:13,color:C.brand,fontWeight:700,fontFamily:"monospace",marginTop:2}}>
                      {showCostDetail.truckId==="INVENTORY"||showCostDetail.truckId==="UNKNOWN"||!showCostDetail.truckId?<span style={{color:C.accent}}>{showCostDetail.allocatedToTruck?`Installed on #${showCostDetail.allocatedToTruck}`:"Unallocated inventory"}</span>:`#${showCostDetail.truckId}`}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"#6b7785",fontWeight:700,textTransform:"uppercase"}}>Category</div>
                    <div style={{fontSize:12,color:C.brand,fontWeight:600,marginTop:2,padding:"2px 8px",background:C.light,borderRadius:4,display:"inline-block"}}>{showCostDetail.category||"Other"}</div>
                  </div>
                </div>
                {showCostDetail.gallons&&showCostDetail.pricePerGallon&&<div style={{marginBottom:12,padding:12,background:"#eff6ff",border:`1px solid ${C.brand}33`,borderRadius:8}}>
                  <div style={{fontSize:10,color:"#6b7785",fontWeight:700,textTransform:"uppercase",marginBottom:6}}>⛽ Fuel Detail</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:8}}>
                    <div><div style={{fontSize:9,color:"#6b7785"}}>Gallons</div><div style={{fontSize:15,fontWeight:700,color:C.brand}}>{Number(showCostDetail.gallons).toFixed(1)}</div></div>
                    <div><div style={{fontSize:9,color:"#6b7785"}}>True $/Gal</div><div style={{fontSize:15,fontWeight:700,color:C.brand}}>${Number(showCostDetail.pricePerGallon).toFixed(4)}</div></div>
                    <div><div style={{fontSize:9,color:"#6b7785"}}>Total</div><div style={{fontSize:15,fontWeight:700,color:C.red}}>${(showCostDetail.total||0).toFixed(2)}</div></div>
                  </div>
                  <div style={{fontSize:9,color:"#94a3b8",marginTop:6,fontStyle:"italic"}}>Includes taxes & delivery fees</div>
                </div>}
                {showCostDetail.notes&&<div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#6b7785",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Notes</div>
                  <div style={{fontSize:12,color:"#334155",padding:10,background:"#f8fafc",borderRadius:6}}>{showCostDetail.notes}</div>
                </div>}
                {Array.isArray(showCostDetail.lineItems)&&showCostDetail.lineItems.length>0&&<div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#6b7785",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Line Items ({showCostDetail.lineItems.length})</div>
                  <div style={{maxHeight:200,overflowY:"auto",border:"1px solid #e2e8f0",borderRadius:6}}>
                    {showCostDetail.lineItems.map((li,idx)=><div key={idx} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",borderBottom:idx<showCostDetail.lineItems.length-1?"1px solid #f1f5f9":"none",fontSize:11}}>
                      <span style={{color:"#334155",flex:1,marginRight:8}}>{li.desc||li.description||"—"}</span>
                      <span style={{color:"#1e293b",fontWeight:600,fontFamily:"monospace"}}>${(li.amount||li.price||0).toFixed(2)}</span>
                    </div>)}
                  </div>
                </div>}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:16,paddingTop:12,borderTop:"1px solid #e2e8f0"}}>
                  {showCostDetail.fileUrl?<a href={showCostDetail.fileUrl} target="_blank" rel="noopener noreferrer" style={{flex:1,textAlign:"center",padding:"10px",background:C.brand,color:"#fff",borderRadius:6,textDecoration:"none",fontWeight:700,fontSize:13}}>📄 View PDF</a>:<div style={{flex:1,padding:"10px",background:"#f8fafc",color:"#94a3b8",borderRadius:6,textAlign:"center",fontSize:11,fontStyle:"italic"}}>No PDF attached (pre-v2.6.4 or bulk-imported)</div>}
                  {(showCostDetail.truckId==="INVENTORY"||!showCostDetail.truckId||showCostDetail.truckId==="UNKNOWN")&&!showCostDetail.allocatedToTruck&&<button onClick={()=>{setAllocModal(showCostDetail);setShowCostDetail(null);}} style={{padding:"10px 14px",background:C.green,color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:13}}>Allocate →</button>}
                  <button onClick={()=>{if(confirm("Delete this invoice?")){saveCosts(costEntries.filter(c=>c.id!==showCostDetail.id));setShowCostDetail(null);}}} style={{padding:"10px 14px",background:"#fff",color:C.red,border:`1px solid ${C.red}`,borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:13}}>Delete</button>
                </div>
              </div>
            </div>
          </div>}

          {/* ═══ QUICK FUEL DETAILED REPORT MODAL ═══ */}
          {showQuickFuelReport&&quickFuelAnalytics&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:8}} onClick={()=>setShowQuickFuelReport(false)}>
            <div style={{background:"#fff",borderRadius:10,maxWidth:900,width:"100%",maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
              {/* Header */}
              <div style={{padding:"16px 20px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:C.brand,color:"#fff"}}>
                <div>
                  <div style={{fontSize:16,fontWeight:800}}>⛽ Quick Fuel Report</div>
                  <div style={{fontSize:11,opacity:0.9,marginTop:2}}>{quickFuelAnalytics.qfEntries.length} purchases · {quickFuelAnalytics.weekCount} weeks · {quickFuelAnalytics.truckCount} trucks</div>
                </div>
                <button onClick={()=>setShowQuickFuelReport(false)} style={{fontSize:20,background:"none",border:"none",color:"#fff",cursor:"pointer",padding:"0 8px",fontWeight:700}}>×</button>
              </div>

              {/* Scrollable body */}
              <div style={{padding:16,overflowY:"auto",flex:1}}>
                {/* Overview stats */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:16}}>
                  <div style={{padding:10,background:C.light,borderRadius:6,border:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Total Spend</div>
                    <div style={{fontSize:18,fontWeight:800,color:C.red,marginTop:2}}>${quickFuelAnalytics.totalCost.toFixed(2)}</div>
                  </div>
                  <div style={{padding:10,background:C.light,borderRadius:6,border:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Total Gallons</div>
                    <div style={{fontSize:18,fontWeight:800,color:C.brand,marginTop:2}}>{quickFuelAnalytics.totalGallons.toFixed(1)}</div>
                  </div>
                  <div style={{padding:10,background:C.light,borderRadius:6,border:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Avg $/Gal</div>
                    <div style={{fontSize:18,fontWeight:800,color:C.dark,marginTop:2}}>${quickFuelAnalytics.avgPrice.toFixed(3)}</div>
                  </div>
                  <div style={{padding:10,background:C.light,borderRadius:6,border:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Drivers</div>
                    <div style={{fontSize:18,fontWeight:800,color:C.green,marginTop:2}}>{quickFuelAnalytics.driverCount}</div>
                  </div>
                </div>

                {/* BY DRIVER */}
                <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${C.brand}`}}>👤 Who's Buying the Fuel (by Driver)</div>
                <div style={{fontSize:11,color:"#6b7785",marginBottom:10}}>Drivers matched to each purchase via the Weekly Board assignment for that week. Purchases with multiple drivers on the same truck that week are split evenly.</div>
                <div style={{marginBottom:20,border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 1fr 1.2fr",background:"#f1f5f9",padding:"8px 10px",fontSize:10,fontWeight:700,color:"#475569",textTransform:"uppercase"}}>
                    <div>Driver</div>
                    <div style={{textAlign:"right"}}>Gallons</div>
                    <div style={{textAlign:"right"}}>Total $</div>
                    <div style={{textAlign:"right"}}>$/Gal</div>
                    <div style={{textAlign:"right"}}>Trucks · Weeks</div>
                  </div>
                  {Object.entries(quickFuelAnalytics.byDriver).sort((a,b)=>b[1].cost-a[1].cost).map(([drv,d])=>
                    <div key={drv} style={{display:"grid",gridTemplateColumns:"1.8fr 1fr 1fr 1fr 1.2fr",padding:"8px 10px",fontSize:12,borderTop:"1px solid #f1f5f9",background:drv==="— Unassigned —"?"#fef3c7":"#fff",alignItems:"center"}}>
                      <div style={{fontWeight:700,color:drv==="— Unassigned —"?"#92400e":"#1e293b"}}>{drv}</div>
                      <div style={{textAlign:"right",fontFamily:"monospace",color:C.brand}}>{d.gallons.toFixed(1)}</div>
                      <div style={{textAlign:"right",fontFamily:"monospace",fontWeight:700,color:C.red}}>${d.cost.toFixed(2)}</div>
                      <div style={{textAlign:"right",fontFamily:"monospace",color:"#6b7785"}}>${d.gallons>0?(d.cost/d.gallons).toFixed(3):"—"}</div>
                      <div style={{textAlign:"right",fontSize:10,color:"#6b7785"}}>{d.trucks.size} · {d.weeks.size}</div>
                    </div>
                  )}
                </div>

                {/* BY TRUCK */}
                <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${C.accent}`}}>🚛 By Truck</div>
                <div style={{marginBottom:20,border:"1px solid #e2e8f0",borderRadius:6,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"0.7fr 1fr 1fr 1fr 1.8fr",background:"#f1f5f9",padding:"8px 10px",fontSize:10,fontWeight:700,color:"#475569",textTransform:"uppercase"}}>
                    <div>Truck</div>
                    <div style={{textAlign:"right"}}>Gallons</div>
                    <div style={{textAlign:"right"}}>Total $</div>
                    <div style={{textAlign:"right"}}>$/Gal</div>
                    <div>Drivers</div>
                  </div>
                  {Object.entries(quickFuelAnalytics.byTruck).sort((a,b)=>b[1].cost-a[1].cost).map(([truckId,d])=>
                    <div key={truckId} style={{display:"grid",gridTemplateColumns:"0.7fr 1fr 1fr 1fr 1.8fr",padding:"8px 10px",fontSize:12,borderTop:"1px solid #f1f5f9",background:truckId==="INVENTORY"?"#fef3c7":"#fff",alignItems:"center",gap:6}}>
                      <div style={{fontWeight:700,color:truckId==="INVENTORY"?"#92400e":C.brand}}>{truckId==="INVENTORY"?"— Unassigned —":`#${truckId}`}</div>
                      <div style={{textAlign:"right",fontFamily:"monospace",color:C.brand}}>{d.gallons.toFixed(1)}</div>
                      <div style={{textAlign:"right",fontFamily:"monospace",fontWeight:700,color:C.red}}>${d.cost.toFixed(2)}</div>
                      <div style={{textAlign:"right",fontFamily:"monospace",color:"#6b7785"}}>${d.gallons>0?(d.cost/d.gallons).toFixed(3):"—"}</div>
                      <div style={{fontSize:10,color:"#6b7785"}}>{[...d.drivers].join(", ")||<span style={{fontStyle:"italic"}}>—</span>}</div>
                    </div>
                  )}
                </div>

                {/* BY WEEK */}
                <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${C.green}`}}>📅 Weekly Breakdown</div>
                <div style={{fontSize:11,color:"#6b7785",marginBottom:10}}>Each week's fuel purchases through Quick Fuel. Click a week to expand truck-level detail.</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {Object.entries(quickFuelAnalytics.byWeek).sort((a,b)=>b[0].localeCompare(a[0])).map(([wkKey,d])=>{
                    const wkLabel=wkKey==="unknown"?"Unknown dates":fWL(new Date(wkKey+"T12:00:00"));
                    return <details key={wkKey} style={{border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>
                      <summary style={{padding:"10px 12px",cursor:"pointer",display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr",alignItems:"center",gap:8,listStyle:"none"}}>
                        <div style={{fontWeight:700,color:"#1e293b",fontSize:12}}>{wkLabel}</div>
                        <div style={{textAlign:"right",fontFamily:"monospace",color:C.brand,fontSize:12}}>{d.gallons.toFixed(1)} gal</div>
                        <div style={{textAlign:"right",fontFamily:"monospace",fontWeight:800,color:C.red,fontSize:13}}>${d.cost.toFixed(2)}</div>
                        <div style={{textAlign:"right",fontSize:10,color:"#6b7785"}}>{d.trucks.size} trucks · {d.drivers.size} drivers</div>
                      </summary>
                      <div style={{borderTop:"1px solid #e2e8f0",padding:10,background:"#f8fafc"}}>
                        <div style={{display:"grid",gridTemplateColumns:"0.6fr 0.8fr 0.8fr 0.8fr 1.4fr 0.8fr",gap:6,fontSize:10,fontWeight:700,color:"#475569",textTransform:"uppercase",marginBottom:4,padding:"4px 6px"}}>
                          <div>Date</div>
                          <div>Truck</div>
                          <div style={{textAlign:"right"}}>Gal</div>
                          <div style={{textAlign:"right"}}>$</div>
                          <div>Driver(s)</div>
                          <div>Invoice</div>
                        </div>
                        {d.entries.sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(e=>
                          <div key={e.id} onClick={()=>{setShowCostDetail(e);setShowQuickFuelReport(false);}} style={{display:"grid",gridTemplateColumns:"0.6fr 0.8fr 0.8fr 0.8fr 1.4fr 0.8fr",gap:6,fontSize:11,padding:"5px 6px",background:"#fff",borderRadius:4,marginBottom:3,cursor:"pointer",alignItems:"center"}}>
                            <div style={{color:"#6b7785"}}>{e.date||"—"}</div>
                            <div style={{fontWeight:700,color:e.truckId==="INVENTORY"?"#92400e":C.brand}}>{e.truckId==="INVENTORY"?"—":`#${e.truckId}`}</div>
                            <div style={{textAlign:"right",fontFamily:"monospace"}}>{e._gallons>0?e._gallons.toFixed(1):"—"}</div>
                            <div style={{textAlign:"right",fontFamily:"monospace",fontWeight:700}}>${(e.total||0).toFixed(2)}</div>
                            <div style={{fontSize:10,color:e._drivers.length?"#1e293b":"#94a3b8",fontStyle:e._drivers.length?"normal":"italic"}}>{e._drivers.length?e._drivers.join(", "):"no driver"}</div>
                            <div style={{fontSize:10,color:"#6b7785",fontFamily:"monospace"}}>{e.invoiceNum||"—"}</div>
                          </div>
                        )}
                      </div>
                    </details>;
                  })}
                </div>
              </div>

              {/* Footer */}
              <div style={{padding:"12px 16px",borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"flex-end",gap:8,flexShrink:0}}>
                <button onClick={()=>{
                  // Export as CSV
                  const rows=[["Date","Truck","Driver(s)","Gallons","Total","$/Gal","Invoice#"]];
                  quickFuelAnalytics.qfEntries.forEach(c=>{
                    const gallons=c.gallons?Number(c.gallons):0;
                    const weekKey=c.date?wK(new Date(c.date)):"";
                    const weekAsgn=attendWeeks[weekKey]||{};
                    const drvs=new Set();
                    drivers.forEach(dd=>{DAYS.forEach(day=>{if(weekAsgn[`${dd.name}-${day}`]===c.truckId)drvs.add(dd.name);});});
                    rows.push([c.date||"",c.truckId||"",[...drvs].join("; "),gallons||"",c.total||0,gallons>0?(c.total/gallons).toFixed(3):"",c.invoiceNum||""]);
                  });
                  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
                  const blob=new Blob([csv],{type:"text/csv"});
                  const url=URL.createObjectURL(blob);
                  const a=document.createElement("a");
                  a.href=url;a.download=`quick-fuel-report-${new Date().toISOString().split("T")[0]}.csv`;a.click();
                  URL.revokeObjectURL(url);
                }} style={{padding:"8px 14px",background:C.green,color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:12}}>📥 Export CSV</button>
                <button onClick={()=>setShowQuickFuelReport(false)} style={{padding:"8px 14px",background:"#fff",color:"#6b7785",border:"1px solid #cbd5e1",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:12}}>Close</button>
              </div>
            </div>
          </div>}

          {/* ═══ COMPREHENSIVE COST ANALYTICS ═══ */}
          {costEntries.length>0&&<div>
            <div style={{...s.secT,marginTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <span>📊 Cost Analytics Dashboard</span>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {quickFuelAnalytics&&<button onClick={()=>setShowQuickFuelReport(true)} style={{padding:"6px 12px",background:C.brand,color:"#fff",fontSize:12,fontWeight:700,border:"none",borderRadius:6,cursor:"pointer"}}>⛽ Quick Fuel Report ({quickFuelAnalytics.qfEntries.length})</button>}
                {quickFuelAnalytics&&<button onClick={()=>{
                  const qfCount=quickFuelAnalytics.qfEntries.length;
                  const qfTotal=quickFuelAnalytics.totalCost;
                  if(!confirm(`Delete all ${qfCount} Quick Fuel entries ($${qfTotal.toFixed(2)})?\n\nThis will let you re-scan the invoices cleanly. Entries with vendor "Quick Fuel" will be removed. Other vendors are unaffected.\n\nThis cannot be undone.`))return;
                  if(!confirm(`Really delete ${qfCount} Quick Fuel entries worth $${qfTotal.toFixed(2)}?`))return;
                  const remaining=costEntries.filter(c=>(c.vendor||"").toLowerCase()!=="quick fuel");
                  saveCosts(remaining);
                  alert(`Deleted ${qfCount} Quick Fuel entries ($${qfTotal.toFixed(2)}). Re-scan from Gmail to re-import cleanly.`);
                }} style={{padding:"6px 12px",background:"#fff",color:C.red,fontSize:12,fontWeight:700,border:`1px solid ${C.red}`,borderRadius:6,cursor:"pointer"}}>🗑 Purge Quick Fuel</button>}
                {(()=>{
                  const ffEntries=costEntries.filter(c=>(c.vendor||"").toLowerCase()==="fuelfox atlanta"||(c.vendor||"").toLowerCase()==="fuelfox");
                  if(ffEntries.length===0)return null;
                  const ffTotal=ffEntries.reduce((a,c)=>a+Number(c.total||0),0);
                  return <button onClick={()=>{
                    if(!confirm(`Delete all ${ffEntries.length} FuelFox entries ($${ffTotal.toFixed(2)})?\n\nThis will let you re-scan the invoices cleanly. Both Service Log and Invoice (DDxxx) entries will be removed. Other vendors are unaffected.\n\nThis cannot be undone.`))return;
                    if(!confirm(`Really delete ${ffEntries.length} FuelFox entries worth $${ffTotal.toFixed(2)}?`))return;
                    const remaining=costEntries.filter(c=>{const v=(c.vendor||"").toLowerCase();return v!=="fuelfox atlanta"&&v!=="fuelfox";});
                    saveCosts(remaining);
                    alert(`Deleted ${ffEntries.length} FuelFox entries ($${ffTotal.toFixed(2)}). Re-scan from Gmail to re-import cleanly.`);
                  }} style={{padding:"6px 12px",background:"#fff",color:C.red,fontSize:12,fontWeight:700,border:`1px solid ${C.red}`,borderRadius:6,cursor:"pointer"}}>🗑 Purge FuelFox ({ffEntries.length})</button>;
                })()}
              </div>
            </div>

            {/* FuelFox overhead redistribution prompt - shown when there are unredistributed Invoice DDxxx entries */}
            {(()=>{
              const pending=costEntries.filter(c=>
                c.vendor==="FuelFox Atlanta"&&
                c.truckId==="INVENTORY"&&
                c.invoiceNum&&/^DD\d+$/.test(c.invoiceNum)
              );
              if(pending.length===0)return null;
              const total=pending.reduce((a,c)=>a+Number(c.total||0),0);
              return <div style={{marginBottom:12,padding:12,background:"#fef3c7",border:"1px solid #fbbf24",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#92400e"}}>⛽ {pending.length} FuelFox Invoice{pending.length>1?"s":""} pending redistribution (${total.toFixed(2)} overhead)</div>
                  <div style={{fontSize:10,color:"#92400e",marginTop:2}}>Click to distribute tax+delivery overhead into each truck's fuel cost from matching Service Log.</div>
                </div>
                <button onClick={redistributeFuelFoxOverhead} style={{padding:"8px 14px",background:C.accent,color:"#fff",fontSize:12,fontWeight:700,border:"none",borderRadius:6,cursor:"pointer",whiteSpace:"nowrap"}}>Redistribute Overhead</button>
              </div>;
            })()}

            {/* Fuel price trend - only shown if there are fuel entries with price data */}
            {(()=>{
              const fuelEntries=costEntries.filter(c=>c.pricePerGallon&&c.gallons&&c.date);
              if(fuelEntries.length===0)return null;
              // Group by month, weight by gallons to get a true avg
              const byMonth={};
              fuelEntries.forEach(c=>{
                const m=(c.date||"").substring(0,7);
                if(!m)return;
                if(!byMonth[m])byMonth[m]={gallons:0,cost:0};
                byMonth[m].gallons+=Number(c.gallons);
                byMonth[m].cost+=Number(c.total);
              });
              const months=Object.keys(byMonth).sort();
              if(months.length===0)return null;
              const avgs=months.map(m=>({month:m,avg:byMonth[m].cost/byMonth[m].gallons,gal:byMonth[m].gallons,cost:byMonth[m].cost}));
              const latest=avgs[avgs.length-1];
              const prev=avgs.length>=2?avgs[avgs.length-2]:null;
              const delta=prev?latest.avg-prev.avg:0;
              const deltaPct=prev?(delta/prev.avg)*100:0;
              const lifetimeAvg=fuelEntries.reduce((a,c)=>a+Number(c.total),0)/fuelEntries.reduce((a,c)=>a+Number(c.gallons),0);
              const lifetimeGal=fuelEntries.reduce((a,c)=>a+Number(c.gallons),0);
              const min=Math.min(...avgs.map(a=>a.avg));
              const max=Math.max(...avgs.map(a=>a.avg));
              return <div style={{marginBottom:16,padding:14,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10}}>
                <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>⛽ Fuel Price Trend <span style={{fontSize:10,color:"#94a3b8",fontWeight:400}}>(true cost including taxes+fees)</span></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:12}}>
                  <div><div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Latest Avg $/Gal</div><div style={{fontSize:20,fontWeight:800,color:C.brand}}>${latest.avg.toFixed(4)}</div><div style={{fontSize:9,color:"#94a3b8"}}>{latest.month} · {latest.gal.toFixed(0)} gal</div></div>
                  {prev&&<div><div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>vs Prev Month</div><div style={{fontSize:20,fontWeight:800,color:delta>0?C.red:C.green}}>{delta>0?"+":""}{deltaPct.toFixed(1)}%</div><div style={{fontSize:9,color:"#94a3b8"}}>${delta>0?"+":""}{delta.toFixed(4)}/gal</div></div>}
                  <div><div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Lifetime Avg</div><div style={{fontSize:20,fontWeight:800,color:C.dark}}>${lifetimeAvg.toFixed(4)}</div><div style={{fontSize:9,color:"#94a3b8"}}>{lifetimeGal.toFixed(0)} gal total</div></div>
                </div>
                <div style={{display:"flex",gap:4,alignItems:"flex-end",height:100,background:"#f8fafc",padding:8,borderRadius:6,border:"1px solid #e2e8f0",overflowX:"auto"}}>
                  {avgs.map(a=>{
                    const range=max-min||0.0001;
                    const h=Math.max(6,((a.avg-min)/range)*70+10);
                    return <div key={a.month} style={{flex:"0 0 auto",minWidth:40,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{fontSize:9,color:"#6b7785",fontWeight:600}}>${a.avg.toFixed(3)}</div>
                      <div title={`${a.month}: ${a.gal.toFixed(0)} gal`} style={{width:"100%",height:h,background:C.brand,borderRadius:"2px 2px 0 0"}}/>
                      <div style={{fontSize:9,color:"#6b7785"}}>{a.month.substring(2)}</div>
                    </div>;
                  })}
                </div>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:6,textAlign:"center"}}>Gallons-weighted average per month · {fuelEntries.length} fuel invoices tracked</div>
              </div>;
            })()}
            
            {/* Top-level KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:16}}>
              <div style={{background:"#fff",borderRadius:8,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Total Spend</div>
                <div style={{fontSize:22,fontWeight:800,color:C.red,marginTop:2}}>${Math.round(costAnalytics.totalAll).toLocaleString()}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>{costAnalytics.entryCount} invoices</div>
              </div>
              <div style={{background:"#fff",borderRadius:8,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Truck Costs</div>
                <div style={{fontSize:22,fontWeight:800,color:C.brand,marginTop:2}}>${Math.round(costAnalytics.truckTotal).toLocaleString()}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>{costAnalytics.truckCount} invoices</div>
              </div>
              <div style={{background:"#fff",borderRadius:8,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Inventory</div>
                <div style={{fontSize:22,fontWeight:800,color:C.accent,marginTop:2}}>${Math.round(costAnalytics.inventoryTotal).toLocaleString()}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>{costAnalytics.inventoryCount} invoices</div>
              </div>
              <div style={{background:"#fff",borderRadius:8,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Avg / Month</div>
                <div style={{fontSize:22,fontWeight:800,color:C.dark,marginTop:2}}>${Math.round(costAnalytics.avgMonthly).toLocaleString()}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>{costAnalytics.sortedMonths.length} months</div>
              </div>
              <div style={{background:"#fff",borderRadius:8,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Last Mo. vs Prev</div>
                <div style={{fontSize:22,fontWeight:800,color:costAnalytics.momChange>0?C.red:C.green,marginTop:2}}>{costAnalytics.momChange>0?"+":""}{costAnalytics.momChange.toFixed(1)}%</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>Month over month</div>
              </div>
              <div style={{background:"#fff",borderRadius:8,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600,textTransform:"uppercase"}}>Active Trucks</div>
                <div style={{fontSize:22,fontWeight:800,color:C.dark,marginTop:2}}>{Object.keys(costAnalytics.byTruck).filter(t=>t!=="INVENTORY").length}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>with cost data</div>
              </div>
            </div>

            {/* Monthly Spend Trend Chart */}
            {costAnalytics.sortedMonths.length>1&&<div style={{background:"#fff",borderRadius:8,padding:14,marginBottom:16,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:10}}>📈 Monthly Spend Trend (Last 12 Months)</div>
              {(()=>{
                const months=costAnalytics.last12||[];
                if(months.length===0)return null;
                const vals=months.map(m=>(costAnalytics.byMonth[m]&&costAnalytics.byMonth[m].total)||0);
                const max=Math.max(...vals,1);
                const chartH=140;
                return <div>
                  <div style={{display:"flex",gap:4,alignItems:"flex-end",height:chartH,background:"#f8fafc",padding:"10px 8px",borderRadius:6,border:"1px solid #f1f5f9"}}>
                    {months.map((m,idx)=>{
                      const v=vals[idx]||0;
                      const h=Math.max(4,(v/max)*(chartH-30));
                      return <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:0}}>
                        <div style={{fontSize:9,color:"#6b7785",fontWeight:600,whiteSpace:"nowrap"}}>${Math.round(v/1000)}k</div>
                        <div style={{width:"90%",height:h,background:`linear-gradient(180deg, ${C.brand} 0%, ${C.brand}aa 100%)`,borderRadius:"3px 3px 0 0",cursor:"pointer"}} title={`${m}: $${Math.round(v).toLocaleString()}`}/>
                      </div>;
                    })}
                  </div>
                  <div style={{display:"flex",gap:4,marginTop:4}}>
                    {months.map(m=><div key={m} style={{flex:1,fontSize:9,color:"#94a3b8",textAlign:"center",fontFamily:"monospace"}}>{m.substring(2)}</div>)}
                  </div>
                </div>;
              })()}
            </div>}

            {/* Category Breakdown Pie-style + Bar */}
            {Object.keys(costAnalytics.byCat).length>0&&<div style={{background:"#fff",borderRadius:8,padding:14,marginBottom:16,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:10}}>🎯 Spend by Category</div>
              {(()=>{
                const catColors={Parts:C.brand,Tires:"#8b5cf6",Labor:"#f59e0b",Fuel:"#10b981",Oil:"#06b6d4",Inventory:"#ec4899","Body/Paint":"#6366f1",Electrical:"#eab308",Inspection:"#14b8a6",Towing:"#ef4444",Registration:"#64748b",Insurance:"#0ea5e9",Other:"#94a3b8"};
                const sorted=Object.entries(costAnalytics.byCat).sort((a,b)=>b[1]-a[1]);
                const total=sorted.reduce((s,[,v])=>s+(v||0),0)||1;
                return <div>
                  {/* Stacked horizontal bar */}
                  <div style={{display:"flex",height:32,borderRadius:6,overflow:"hidden",marginBottom:10,border:"1px solid #e2e8f0"}}>
                    {sorted.map(([cat,amt])=>{
                      const pct=(amt/total)*100;
                      return <div key={cat} style={{width:`${pct}%`,background:catColors[cat]||"#94a3b8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700,minWidth:pct>3?"auto":0,overflow:"hidden"}} title={`${cat}: $${Math.round(amt).toLocaleString()} (${pct.toFixed(1)}%)`}>
                        {pct>6?cat:""}
                      </div>;
                    })}
                  </div>
                  {/* Legend with amounts */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:6}}>
                    {sorted.map(([cat,amt])=>{
                      const pct=(amt/total)*100;
                      return <div key={cat} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,padding:"4px 6px",background:"#f8fafc",borderRadius:4}}>
                        <div style={{width:10,height:10,background:catColors[cat]||"#94a3b8",borderRadius:2,flexShrink:0}}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat}</div>
                          <div style={{fontSize:10,color:"#6b7785"}}>${Math.round(amt).toLocaleString()} · {pct.toFixed(1)}%</div>
                        </div>
                      </div>;
                    })}
                  </div>
                </div>;
              })()}
            </div>}

            {/* Top 10 Trucks - Horizontal Bar Chart */}
            {costAnalytics.topTrucks.length>0&&<div style={{background:"#fff",borderRadius:8,padding:14,marginBottom:16,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:10}}>🚚 Top 10 Trucks by Spend</div>
              {(()=>{
                const max=(costAnalytics.topTrucks[0]&&costAnalytics.topTrucks[0][1].total)||1;
                return <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {costAnalytics.topTrucks.map(([tid,data])=>{
                    const pct=(data.total/max)*100;
                    return <div key={tid} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:60,fontSize:11,fontWeight:700,fontFamily:"monospace",color:C.brand,cursor:"pointer",textDecoration:"underline",flexShrink:0}} onClick={()=>setHistoryTruck(tid)}>#{tid}</div>
                      <div style={{flex:1,height:22,background:"#f1f5f9",borderRadius:4,position:"relative",overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg, ${C.brand} 0%, ${C.brand}dd 100%)`,borderRadius:4,display:"flex",alignItems:"center",paddingLeft:6}}>
                          <span style={{fontSize:10,color:"#fff",fontWeight:700,whiteSpace:"nowrap"}}>{data.count} inv</span>
                        </div>
                      </div>
                      <div style={{width:80,fontSize:12,fontWeight:700,color:C.dark,textAlign:"right",flexShrink:0}}>${Math.round(data.total).toLocaleString()}</div>
                    </div>;
                  })}
                </div>;
              })()}
            </div>}

            {/* Top Vendors */}
            {costAnalytics.topVendors.length>0&&<div style={{background:"#fff",borderRadius:8,padding:14,marginBottom:16,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:10}}>🏢 Top Vendors</div>
              {(()=>{
                const max=(costAnalytics.topVendors[0]&&costAnalytics.topVendors[0][1].total)||1;
                return <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {costAnalytics.topVendors.map(([vendor,data])=>{
                    const pct=(data.total/max)*100;
                    return <div key={vendor} style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:160,fontSize:11,fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{vendor}</div>
                      <div style={{flex:1,height:20,background:"#f1f5f9",borderRadius:4,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg, ${C.accent} 0%, ${C.accent}dd 100%)`,borderRadius:4}}/>
                      </div>
                      <div style={{width:100,fontSize:11,color:C.dark,textAlign:"right",flexShrink:0}}>
                        <div style={{fontWeight:700}}>${Math.round(data.total).toLocaleString()}</div>
                        <div style={{fontSize:9,color:"#94a3b8"}}>{data.count} inv</div>
                      </div>
                    </div>;
                  })}
                </div>;
              })()}
            </div>}

            {/* Monthly spend heatmap by category */}
            {costAnalytics.last12.length>2&&Object.keys(costAnalytics.byCat).length>0&&<div style={{background:"#fff",borderRadius:8,padding:14,marginBottom:16,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:10}}>🔥 Category Heatmap by Month</div>
              {(()=>{
                const months=costAnalytics.last12;
                const topCats=Object.entries(costAnalytics.byCat).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([c])=>c);
                // Find max for each category to normalize
                const catMax={};
                topCats.forEach(cat=>{
                  catMax[cat]=Math.max(1,...months.map(m=>(costAnalytics.byMonth[m]&&costAnalytics.byMonth[m].byCat&&costAnalytics.byMonth[m].byCat[cat])||0));
                });
                return <div style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",width:"100%",fontSize:10}}>
                    <thead><tr>
                      <th style={{padding:"4px 6px",textAlign:"left",color:"#6b7785",fontWeight:600}}>Category</th>
                      {months.map(m=><th key={m} style={{padding:"4px 4px",color:"#6b7785",fontWeight:600,fontFamily:"monospace",fontSize:9}}>{m.substring(2)}</th>)}
                    </tr></thead>
                    <tbody>
                      {topCats.map(cat=>
                        <tr key={cat}>
                          <td style={{padding:"4px 6px",fontWeight:700,color:"#1e293b",whiteSpace:"nowrap"}}>{cat}</td>
                          {months.map(m=>{
                            const v=(costAnalytics.byMonth[m]&&costAnalytics.byMonth[m].byCat&&costAnalytics.byMonth[m].byCat[cat])||0;
                            const intensity=(catMax[cat]&&catMax[cat]>0)?(v/catMax[cat]):0;
                            const bg=v===0?"#f8fafc":`rgba(30, 91, 146, ${0.15+intensity*0.7})`;
                            return <td key={m} style={{padding:"4px 2px",background:bg,color:intensity>0.5?"#fff":"#1e293b",textAlign:"center",fontSize:9,fontWeight:600,border:"1px solid #f1f5f9",minWidth:40}} title={`${cat} ${m}: $${Math.round(v).toLocaleString()}`}>
                              {v>0?`$${Math.round(v/100)/10}k`:"—"}
                            </td>;
                          })}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>;
              })()}
            </div>}

            {/* Cost per truck by category (matrix view) */}
            {costAnalytics.topTrucks.length>0&&Object.keys(costAnalytics.byCat).length>0&&<div style={{background:"#fff",borderRadius:8,padding:14,marginBottom:16,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:10}}>🔍 Cost Matrix (Truck × Category)</div>
              {(()=>{
                const topTruckIds=costAnalytics.topTrucks.slice(0,10).map(([t])=>t);
                const topCats=Object.entries(costAnalytics.byCat).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([c])=>c);
                return <div style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",width:"100%",fontSize:10}}>
                    <thead><tr>
                      <th style={{padding:"6px",textAlign:"left",color:"#6b7785",fontWeight:600,borderBottom:"2px solid #e2e8f0"}}>Truck</th>
                      {topCats.map(c=><th key={c} style={{padding:"6px",color:"#6b7785",fontWeight:600,borderBottom:"2px solid #e2e8f0",textAlign:"right"}}>{c}</th>)}
                      <th style={{padding:"6px",color:"#6b7785",fontWeight:700,borderBottom:"2px solid #e2e8f0",textAlign:"right"}}>Total</th>
                    </tr></thead>
                    <tbody>
                      {topTruckIds.map(tid=>{
                        const data=costAnalytics.byTruck[tid];
                        return <tr key={tid} style={{borderBottom:"1px solid #f1f5f9"}}>
                          <td style={{padding:"6px",fontWeight:700,fontFamily:"monospace",color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setHistoryTruck(tid)}>#{tid}</td>
                          {topCats.map(cat=>{
                            const v=data.cats[cat]||0;
                            return <td key={cat} style={{padding:"6px",textAlign:"right",color:v>0?"#1e293b":"#cbd5e1",fontWeight:v>0?600:400}}>{v>0?`$${Math.round(v).toLocaleString()}`:"—"}</td>;
                          })}
                          <td style={{padding:"6px",textAlign:"right",fontWeight:800,color:C.red}}>${Math.round(data.total).toLocaleString()}</td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>;
              })()}
            </div>}
          </div>}

          {/* Cost Ledger */}
          <div style={{...s.secT,marginTop:20}}>Cost Ledger</div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <select style={s.fSel} value={costFilter} onChange={e=>setCostFilter(e.target.value)}>
              <option value="all">All Trucks</option>
              {[...new Set(costEntries.map(c=>c.truckId))].sort().map(tid=><option key={tid} value={tid}>#{tid}</option>)}
            </select>
            <select style={s.fSel} value={costCatFilter} onChange={e=>setCostCatFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {COST_CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={s.tWrap}><table style={{...s.table,fontSize:12}}><thead><tr>
            {["Date","Truck #","Vendor","Category","Amount","Gal","$/Gal","Invoice #","Notes","PDF",""].map(h=><th key={h} style={{...s.th,whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead><tbody>
            {costEntries.filter(c=>(costFilter==="all"||c.truckId===costFilter)&&(costCatFilter==="all"||c.category===costCatFilter)).sort((a,b)=>b.date?.localeCompare(a.date)).map(c=>
              <tr key={c.id} style={{...s.tr,cursor:"pointer"}} onClick={()=>setShowCostDetail(c)}>
                <td style={s.ltd}>{c.date}</td>
                <td style={{...s.ltd,fontFamily:"monospace",fontWeight:700,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={(e)=>{e.stopPropagation();setHistoryTruck(c.truckId);}}>#{c.truckId}</td>
                <td style={s.ltd}>{c.vendor}</td>
                <td style={s.ltd}><span style={{fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:3,background:C.light,color:C.brand}}>{c.category}</span></td>
                <td style={{...s.ltd,fontWeight:700,color:C.red}}>${(c.total||0).toLocaleString()}</td>
                <td style={{...s.ltd,color:c.gallons?C.dark:"#cbd5e1",fontFamily:"monospace"}}>{c.gallons?Number(c.gallons).toFixed(1):"—"}</td>
                <td style={{...s.ltd,color:c.pricePerGallon?C.brand:"#cbd5e1",fontFamily:"monospace",fontWeight:700}}>{c.pricePerGallon?`$${Number(c.pricePerGallon).toFixed(4)}`:"—"}</td>
                <td style={{...s.ltd,color:"#94a3b8"}}>{c.invoiceNum||"—"}</td>
                <td style={{...s.ltd,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis"}}>{c.notes||"—"}</td>
                <td style={s.ltd} onClick={(e)=>e.stopPropagation()}>{c.fileUrl?<a href={c.fileUrl} target="_blank" rel="noopener noreferrer" style={{color:C.brand,fontSize:16,textDecoration:"none"}} title="View PDF">📄</a>:<span style={{color:"#cbd5e1"}}>—</span>}</td>
                <td style={s.ltd} onClick={(e)=>e.stopPropagation()}><button style={s.xBtn} onClick={()=>deleteCost(c.id)}>×</button></td>
              </tr>
            )}
            {costEntries.filter(c=>(costFilter==="all"||c.truckId===costFilter)&&(costCatFilter==="all"||c.category===costCatFilter)).length===0&&
              <tr><td colSpan={11} style={{...s.ltd,textAlign:"center",color:"#94a3b8",padding:20}}>No cost entries yet. Upload invoices or add manually.</td></tr>
            }
          </tbody></table></div>
        </div>}

      </div>

      {/* ── Repair Form Modal (from truck status board) ── */}
      {showRepairForm&&tab==="board"&&<div style={s.modal} onClick={()=>setShowRepairForm(null)}><div style={s.modalBox} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:12}}>Log Repair — Truck #{showRepairForm}</div>
        <select style={s.fInp} value={repairForm.reason} onChange={e=>setRepairForm({...repairForm,reason:e.target.value})}>
          {OOS_REASONS.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
        <input style={s.fInp} placeholder="Notes" value={repairForm.notes} onChange={e=>setRepairForm({...repairForm,notes:e.target.value})}/>
        <input style={s.fInp} placeholder="Shop / Location" value={repairForm.shop} onChange={e=>setRepairForm({...repairForm,shop:e.target.value})}/>
        <div style={{display:"flex",gap:6}}>
          <input style={s.fInp} type="date" value={repairForm.estReturn} onChange={e=>setRepairForm({...repairForm,estReturn:e.target.value})}/>
          <input style={s.fInp} type="number" placeholder="Cost $" value={repairForm.cost} onChange={e=>setRepairForm({...repairForm,cost:e.target.value})}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <button style={s.saveBtn} onClick={()=>{addRepair(showRepairForm);commitEdit(`${showRepairForm}-${DAYS[todayDI()]}`,"status","OOS");}}>Log & Set OOS</button>
          <button style={s.canBtn} onClick={()=>setShowRepairForm(null)}>Cancel</button>
        </div>
      </div></div>}

      {/* ── Truck Report Modal ── */}
      {historyTruck&&(()=>{
        const t=trucks.find(x=>x.id===historyTruck);
        const tRepairs=repairs.filter(r=>r.truckId===historyTruck).sort((a,b)=>b.id-a.id);
        const tCosts=costEntries.filter(c=>c.truckId===historyTruck).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
        const totalRepairCost=tRepairs.reduce((s,r)=>s+(r.cost||0),0);
        const totalInvoiceCost=tCosts.reduce((s,c)=>s+(c.total||0),0);
        const totalCost=totalRepairCost+totalInvoiceCost;
        const openRepairs=tRepairs.filter(r=>r.status==="open");
        const dr=findDriverForTruck(historyTruck);
        const catBreakdown={};
        tCosts.forEach(c=>{if(!catBreakdown[c.category])catBreakdown[c.category]=0;catBreakdown[c.category]+=(c.total||0);});

        return <div style={s.modal} onClick={()=>setHistoryTruck(null)}><div style={{...s.modalBox,maxWidth:520}} onClick={e=>e.stopPropagation()}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:22,fontWeight:800,fontFamily:"monospace",color:C.dark}}>#{historyTruck}</div>
              <div style={{fontSize:12,color:"#6b7785",marginTop:2}}>Truck Report</div>
            </div>
            <button onClick={()=>setHistoryTruck(null)} style={s.xBtn}>×</button>
          </div>

          {/* Specs */}
          {t&&<div style={{background:"#f8fafc",borderRadius:8,padding:12,marginBottom:12,border:"1px solid #e2e8f0"}}>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12}}>
              <div><span style={{color:"#6b7785"}}>Type:</span> <span style={{fontWeight:700}}>{t.type==="straight"?"Box Truck":"Tractor"}</span></div>
              <div><span style={{color:"#6b7785"}}>Make:</span> <span style={{fontWeight:700}}>{t.mk}</span></div>
              <div><span style={{color:"#6b7785"}}>Trans:</span> <span style={{fontWeight:700,color:t.tr==="A"?C.green:C.accent}}>{t.tr==="A"?"Auto":"Manual"}</span></div>
              <div><span style={{color:"#6b7785"}}>Axle:</span> <span style={{fontWeight:700}}>{t.ax}</span></div>
            </div>
            {dr&&<div style={{marginTop:6,fontSize:12}}><span style={{color:"#6b7785"}}>Current Driver:</span> <span style={{fontWeight:700,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{setHistoryTruck(null);setTimeout(()=>setDriverReport(dr.name),100);}}>{dr.name}</span></div>}
            {openRepairs.length>0&&<div style={{marginTop:6,fontSize:12,color:C.red,fontWeight:700}}>⚠ {openRepairs.length} open repair{openRepairs.length>1?"s":""}</div>}
          </div>}

          {/* Cost Summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            <div style={{background:"#fff",borderRadius:6,padding:"8px 10px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:C.red}}>${Math.round(totalCost).toLocaleString()}</div>
              <div style={{fontSize:9,color:"#6b7785"}}>Total Cost</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"8px 10px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:C.yellow}}>${Math.round(totalRepairCost).toLocaleString()}</div>
              <div style={{fontSize:9,color:"#6b7785"}}>Repairs</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"8px 10px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:C.brand}}>${Math.round(totalInvoiceCost).toLocaleString()}</div>
              <div style={{fontSize:9,color:"#6b7785"}}>Invoices</div>
            </div>
          </div>

          {/* Category breakdown */}
          {Object.keys(catBreakdown).length>0&&<div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#1e293b",marginBottom:4}}>Cost by Category</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.entries(catBreakdown).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>
                <span key={cat} style={{fontSize:10,padding:"3px 8px",background:C.light,color:C.dark,borderRadius:4,fontWeight:600}}>{cat}: ${Math.round(amt).toLocaleString()}</span>
              )}
            </div>
          </div>}

          {/* Repair History */}
          <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:6,borderTop:"2px solid #e2e8f0",paddingTop:12}}>Repair History ({tRepairs.length})</div>
          {tRepairs.length===0&&<div style={{fontSize:11,color:"#94a3b8",padding:"8px 0"}}>No repairs logged.</div>}
          {tRepairs.map(r=>
            <div key={r.id} style={{padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:600,fontSize:12}}>{r.reason}</span>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:r.status==="open"?C.red+"18":C.green+"18",color:r.status==="open"?C.red:C.green}}>{r.status==="open"?"OPEN":"CLOSED"}</span>
              </div>
              {r.notes&&<div style={{fontSize:11,color:"#6b7785"}}>{r.notes}</div>}
              <div style={{fontSize:10,color:"#94a3b8"}}>
                In: {dateStr(r.dateIn)}{r.dateClosed&&` · Out: ${dateStr(r.dateClosed)}`}{r.cost>0&&` · $${r.cost.toLocaleString()}`}{r.shop&&` · ${r.shop}`}
              </div>
            </div>
          )}

          {/* Cost History */}
          <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:6,borderTop:"2px solid #e2e8f0",paddingTop:12,marginTop:8}}>Invoice / Cost History ({tCosts.length})</div>
          {tCosts.length===0&&<div style={{fontSize:11,color:"#94a3b8",padding:"8px 0"}}>No invoices logged.</div>}
          {tCosts.map(c=>
            <div key={c.id} style={{padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><span style={{fontWeight:600,fontSize:12}}>{c.vendor}</span><span style={{fontSize:10,color:C.brand,marginLeft:6,fontWeight:600,padding:"1px 5px",background:C.light,borderRadius:3}}>{c.category}</span></div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontWeight:700,fontSize:13,color:C.red}}>${(c.total||0).toLocaleString()}</span>
                  <button onClick={()=>setReassignModal(c)} style={{fontSize:9,padding:"3px 6px",background:"#fff",color:C.brand,border:`1px solid ${C.brand}44`,borderRadius:3,cursor:"pointer",fontWeight:600}}>Reassign</button>
                </div>
              </div>
              <div style={{fontSize:10,color:"#94a3b8"}}>
                {c.date}{c.invoiceNum&&` · Inv #${c.invoiceNum}`}{c.notes&&` · ${c.notes}`}
                {c.fileUrl&&<> · <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" style={{color:C.brand,fontWeight:600,textDecoration:"none"}}>📄 View PDF</a></>}
              </div>
            </div>
          )}

          {/* Driver History for this truck */}
          {(()=>{
            const driverHist=getTruckDriverHistory(historyTruck);
            return <div>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:6,borderTop:"2px solid #e2e8f0",paddingTop:12,marginTop:8}}>Driver History ({driverHist.length})</div>
              {driverHist.length===0&&<div style={{fontSize:11,color:"#94a3b8",padding:"8px 0"}}>No driver history recorded yet.</div>}
              {driverHist.map(dh=>
                <div key={dh.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f1f5f9"}}>
                  <div>
                    <span style={{fontSize:12,fontWeight:600,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{setHistoryTruck(null);setTimeout(()=>setDriverReport(dh.name),100);}}>{dh.name}</span>
                    <span style={{fontSize:10,color:"#94a3b8",marginLeft:6}}>{dh.role}</span>
                  </div>
                  <div style={{fontSize:11,color:"#6b7785"}}>{dh.days} day{dh.days>1?"s":""} · {dh.weeks} week{dh.weeks>1?"s":""}</div>
                </div>
              )}
            </div>;
          })()}

          <button onClick={()=>setHistoryTruck(null)} style={{...s.canBtn,marginTop:12,width:"100%"}}>Close Report</button>
        </div></div>;
      })()}

      {/* ── Reassign Cost Entry Modal ── */}
      {reassignModal&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}} onClick={()=>setReassignModal(null)}>
        <div style={{background:"#fff",borderRadius:10,padding:20,maxWidth:440,width:"100%",maxHeight:"85vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:4}}>Reassign Cost Entry</div>
          <div style={{fontSize:12,color:"#6b7785",marginBottom:4}}>{reassignModal.vendor} · ${(reassignModal.total||0).toFixed(2)}</div>
          <div style={{fontSize:11,color:"#94a3b8",marginBottom:12}}>{reassignModal.date}{reassignModal.invoiceNum&&` · Inv #${reassignModal.invoiceNum}`}</div>
          <div style={{fontSize:11,color:"#6b7785",marginBottom:8,padding:"6px 10px",background:"#fef3c7",borderRadius:4}}>Currently assigned to: <strong>{reassignModal.truckId}</strong></div>
          
          <button onClick={()=>reassignCost(reassignModal.id,"INVENTORY")} style={{width:"100%",padding:"10px",background:C.brand,color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:12,marginBottom:10}}>📦 Move to INVENTORY (shelf stock)</button>
          
          <div style={{fontSize:12,fontWeight:600,color:"#1e293b",marginBottom:6}}>Or assign to a specific truck:</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,maxHeight:280,overflowY:"auto",marginBottom:10}}>
            {trucks.filter(t=>t.id!==reassignModal.truckId).sort((a,b)=>a.id.localeCompare(b.id)).map(t=>
              <button key={t.id} onClick={()=>reassignCost(reassignModal.id,t.id)} style={{fontSize:10,padding:"8px 2px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:4,cursor:"pointer",fontWeight:600,fontFamily:"monospace"}}>{t.id}</button>
            )}
          </div>
          {retiredTrucks.length>0&&<div>
            <div style={{fontSize:11,fontWeight:600,color:"#94a3b8",marginBottom:4}}>Retired trucks:</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:10}}>
              {retiredTrucks.map(t=>
                <button key={t.id} onClick={()=>reassignCost(reassignModal.id,t.id)} style={{fontSize:10,padding:"8px 2px",background:"#fafbfc",border:"1px dashed #cbd5e1",borderRadius:4,cursor:"pointer",fontWeight:600,fontFamily:"monospace",color:"#6b7785"}}>{t.id}</button>
              )}
            </div>
          </div>}
          <button onClick={()=>setReassignModal(null)} style={{width:"100%",padding:"8px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:6,cursor:"pointer"}}>Cancel</button>
        </div>
      </div>}

      {/* ── Driver Report Modal ── */}
      {driverReport&&(()=>{
        const d=drivers.find(x=>x.name===driverReport);
        const truckHist=getDriverTruckHistory(driverReport);
        const a=attendance[driverReport]||{worked:0,off:0,vac:0,calledOut:0,noShow:0,unassigned:0,totalDays:0};
        const scheduledDays=a.totalDays-a.vac;
        const rate=scheduledDays>0?Math.round((a.worked/scheduledDays)*100):0;
        const currentTruck=asgn[`${driverReport}-${DAYS[Math.min(todayDI(),4)]}`]||"";
        const isOff=OFF_OPTS.includes(currentTruck);

        return <div style={s.modal} onClick={()=>setDriverReport(null)}><div style={{...s.modalBox,maxWidth:520}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:C.dark}}>{drvIcon(d?.role)} {driverReport}</div>
              <div style={{fontSize:12,color:"#6b7785",marginTop:2}}>{d?.role||"Driver"} · {d?.category||""}</div>
            </div>
            <button onClick={()=>setDriverReport(null)} style={s.xBtn}>×</button>
          </div>

          <div style={{background:"#f8fafc",borderRadius:8,padding:12,marginBottom:12,border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:12}}>
              <span style={{color:"#6b7785"}}>Today:</span>{" "}
              {currentTruck&&!isOff?<span style={{fontWeight:700,fontFamily:"monospace",color:C.brand}}>Truck #{currentTruck}</span>
                :isOff?<span style={{fontWeight:700,color:C.accent}}>{currentTruck}</span>
                :<span style={{color:"#94a3b8"}}>Not assigned</span>}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:6,marginBottom:12}}>
            <div style={{background:"#fff",borderRadius:6,padding:"6px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:rate>=90?C.green:rate>=70?C.accent:C.red}}>{rate}%</div>
              <div style={{fontSize:8,color:"#6b7785"}}>Attend Rate</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"6px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:C.green}}>{a.worked}</div>
              <div style={{fontSize:8,color:"#6b7785"}}>Days Worked</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"6px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:a.calledOut>=3?C.red:C.accent}}>{a.calledOut}</div>
              <div style={{fontSize:8,color:"#6b7785"}}>Called Out</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"6px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:a.noShow>=1?C.red:"#6b7785"}}>{a.noShow}</div>
              <div style={{fontSize:8,color:"#6b7785"}}>No Shows</div>
            </div>
          </div>

          <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:6,borderTop:"2px solid #e2e8f0",paddingTop:12}}>Vehicle History ({truckHist.length} trucks)</div>
          {truckHist.length===0&&<div style={{fontSize:11,color:"#94a3b8",padding:"8px 0"}}>No vehicle history recorded yet.</div>}
          {truckHist.map(th=>
            <div key={th.truckId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div>
                <span style={{fontFamily:"monospace",fontWeight:700,fontSize:13,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{setDriverReport(null);setTimeout(()=>setHistoryTruck(th.truckId),100);}}>#{th.truckId}</span>
                <span style={{fontSize:10,color:"#94a3b8",marginLeft:6}}>{th.type==="straight"?th.mk:"Tractor"} · {th.tr==="A"?"Auto":"Man"}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,fontWeight:600,color:"#1e293b"}}>{th.days} day{th.days>1?"s":""}</div>
                {th.lastSeen&&<div style={{fontSize:9,color:"#94a3b8"}}>Last: {dateStr(th.lastSeen)}</div>}
              </div>
            </div>
          )}

          <button onClick={()=>setDriverReport(null)} style={{...s.canBtn,marginTop:12,width:"100%"}}>Close Report</button>
        </div></div>;
      })()}
    </div>
  );
}

// ── Sub-components ──
function TSRow({t,tStat,ec,ev,sev,se,ce,gs,onOOS}){
  const [showManual, setShowManual] = useState(false);
  return <tr style={s.tr}><td style={{...s.td,fontWeight:700,fontFamily:"monospace",color:"#1e293b"}}>{t.id}</td><td style={{...s.td,fontSize:11}}>{t.type==="straight"?t.mk:"Tractor"}</td>
    <td style={s.td}><span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:t.tr==="A"?"#27ae6018":"#e6a81718",color:t.tr==="A"?C.green:C.accent}}>{t.tr==="A"?"A":"M"}</span></td>
    <td style={{...s.td,fontSize:11}}>{t.ax==="Tandem"?"T":"S"}</td>
    {DAYS.map(day=>{const key=`${t.id}-${day}`;const val=tStat[key]||"";const st2=gs(t.id,day);const isE=ec===key;
      const pick=(v)=>{
        if(v==="__manual__"){setShowManual(true);sev(val||"");return;}
        if(v==="OOS"){ce(key,"status","OOS");onOOS();setShowManual(false);return;}
        ce(key,"status",v);
        setShowManual(false);
      };
      return <td key={day} style={{...s.td,background:SC[st2]+"0a",minWidth:100}} onClick={()=>{if(!isE){se(key,val);setShowManual(false);}}}>
        {isE?<div style={{display:"flex",flexDirection:"column",gap:4,padding:2}} onClick={e=>e.stopPropagation()}>
          {!showManual?<>
            <select autoFocus value="" onChange={e=>pick(e.target.value)} style={{width:"100%",padding:"6px 4px",fontSize:11,background:"#fff",color:"#1e293b",border:`1px solid ${C.brand}`,borderRadius:4,outline:"none",fontWeight:600}}>
              <option value="">— Select status —</option>
              <option value="Available">Available</option>
              <option value="OOS">Out of Service (opens repair)</option>
              <option value="@ Interstate">@ Interstate</option>
              <option value="@ Shop">@ Shop</option>
              <option value="__manual__">Manual entry...</option>
            </select>
            <button onClick={()=>{se(null);setShowManual(false);}} style={{fontSize:9,padding:"3px 6px",background:"#f1f5f9",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:3,cursor:"pointer"}}>Cancel</button>
          </>:<>
            <input autoFocus value={ev} onChange={e=>sev(e.target.value)} placeholder="Type status..." onKeyDown={e=>{if(e.key==="Enter"){ce(key,"status");setShowManual(false);}if(e.key==="Escape"){sev("");se(null);setShowManual(false);}}} style={s.cInp}/>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>{ce(key,"status");setShowManual(false);}} style={{flex:1,fontSize:9,padding:"3px 6px",background:C.green,color:"#fff",border:"none",borderRadius:3,cursor:"pointer",fontWeight:700}}>Save</button>
              <button onClick={()=>setShowManual(false)} style={{flex:1,fontSize:9,padding:"3px 6px",background:"#f1f5f9",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:3,cursor:"pointer"}}>Back</button>
            </div>
          </>}
        </div>
        :<span style={{cursor:"pointer",color:SC[st2],fontWeight:600,fontSize:11}}>{val||"—"}</span>}
      </td>;
    })}
  </tr>;
}
function Stat({l,v,sub,c}){return <div style={s.statCard}><div style={{fontSize:28,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:12,color:"#6b7785",marginTop:4}}>{l}</div>{sub&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{sub}</div>}</div>;}
function Row({l,v}){return <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:10,color:"#6b7785"}}>{l}</span><span style={{fontSize:11,color:"#1e293b",fontWeight:600}}>{v}</span></div>;}

function ManualCostForm({trucks,cats,onAdd}){
  const[show,setShow]=useState(false);
  const[f,setF]=useState({truckId:"",vendor:"",date:new Date().toISOString().split("T")[0],invoiceNum:"",total:"",category:"Parts",notes:""});
  const submit=()=>{
    if(!f.truckId||!f.total)return;
    onAdd({...f,total:Number(f.total),lineItems:[]});
    setF({truckId:"",vendor:"",date:new Date().toISOString().split("T")[0],invoiceNum:"",total:"",category:"Parts",notes:""});
    setShow(false);
  };
  if(!show) return <button onClick={()=>setShow(true)} style={{...s.wBtn,marginBottom:8}}>+ Add Cost Manually</button>;
  return <div style={{...s.addForm,marginBottom:16}}>
    <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>Manual Cost Entry</div>
    <div style={{display:"flex",gap:6}}>
      <select style={s.fInp} value={f.truckId} onChange={e=>setF({...f,truckId:e.target.value})}>
        <option value="">Truck #</option>
        {trucks.map(t=><option key={t.id} value={t.id}>#{t.id} — {t.type==="straight"?t.mk:"Tractor"}</option>)}
      </select>
      <select style={s.fInp} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
        {cats.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
    </div>
    <div style={{display:"flex",gap:6}}>
      <input style={s.fInp} placeholder="Vendor / Shop" value={f.vendor} onChange={e=>setF({...f,vendor:e.target.value})}/>
      <input style={s.fInp} type="number" placeholder="Amount $" value={f.total} onChange={e=>setF({...f,total:e.target.value})}/>
    </div>
    <div style={{display:"flex",gap:6}}>
      <input style={s.fInp} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/>
      <input style={s.fInp} placeholder="Invoice #" value={f.invoiceNum} onChange={e=>setF({...f,invoiceNum:e.target.value})}/>
    </div>
    <input style={s.fInp} placeholder="Notes" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/>
    <div style={{display:"flex",gap:8}}>
      <button style={s.saveBtn} onClick={submit}>Save Entry</button>
      <button style={s.canBtn} onClick={()=>setShow(false)}>Cancel</button>
    </div>
  </div>;
}

// ── STYLES ──
const s={
  wrap:{fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif",background:"#f5f7fa",color:"#334155",minHeight:"100vh",width:"100%"},
  header:{background:"#fff",borderBottom:"2px solid #e2e8f0",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  hInner:{padding:"12px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8},
  tabs:{display:"flex",gap:0,overflowX:"auto"},
  tab:{padding:"10px 14px",fontSize:12,fontWeight:500,color:"#6b7785",background:"none",border:"none",borderBottom:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap",position:"relative",outline:"none",WebkitTapHighlightColor:"transparent",WebkitAppearance:"none"},
  tabOn:{color:C.brand,borderBottomColor:C.brand,fontWeight:700},
  badge:{position:"absolute",top:4,right:2,fontSize:9,fontWeight:700,background:C.red,color:"#fff",borderRadius:10,padding:"1px 5px",minWidth:16,textAlign:"center"},
  body:{padding:"16px 12px 40px",maxWidth:1200,margin:"0 auto"},
  statGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:10},
  statCard:{background:"#fff",borderRadius:10,padding:"16px 14px",border:"1px solid #e2e8f0",boxShadow:"0 1px 2px rgba(0,0,0,0.03)"},
  secT:{fontSize:14,fontWeight:700,color:"#1e293b",marginBottom:10},
  bGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6},
  bItem:{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#fff",borderRadius:6,border:"1px solid #e2e8f0"},
  weekNav:{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"},
  wBtn:{padding:"6px 12px",fontSize:12,background:"#fff",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:6,cursor:"pointer"},
  wBtnA:{padding:"6px 12px",fontSize:12,background:C.brand,color:"#fff",border:`1px solid ${C.brand}`,borderRadius:6,cursor:"pointer",fontWeight:600},
  wLbl:{fontSize:14,fontWeight:700,color:"#1e293b",flex:1,textAlign:"center"},
  bSel:{padding:"8px 14px",fontSize:13,fontWeight:600,background:"#fff",color:"#1e293b",border:"1px solid #d1d9e0",borderRadius:6,outline:"none"},
  sayBtn:{padding:"6px 14px",fontSize:12,fontWeight:700,background:"#fff",color:C.brand,border:`2px solid ${C.brand}`,borderRadius:6,cursor:"pointer",whiteSpace:"nowrap"},
  jumpBtn:{padding:"6px 14px",fontSize:12,fontWeight:600,background:"#fff",color:C.brand,border:`1px solid ${C.brand}55`,borderRadius:6,cursor:"pointer",whiteSpace:"nowrap"},
  sayMini:{marginLeft:4,padding:"1px 4px",fontSize:9,fontWeight:700,background:C.light,color:C.brand,border:`1px solid ${C.brand}44`,borderRadius:3,cursor:"pointer",verticalAlign:"middle"},
  tWrap:{overflowX:"auto",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff"},
  table:{width:"100%",borderCollapse:"collapse",fontSize:12},
  th:{padding:"8px 6px",textAlign:"left",background:"#f8fafc",color:"#6b7785",fontWeight:600,fontSize:10,textTransform:"uppercase",letterSpacing:.5,borderBottom:"1px solid #e2e8f0"},
  thS:{position:"sticky",left:0,zIndex:1,background:"#f8fafc"},
  tr:{borderBottom:"1px solid #f1f5f9"},
  td:{padding:"6px",cursor:"pointer",minWidth:50,verticalAlign:"top"},
  tdN:{fontWeight:600,color:"#1e293b",whiteSpace:"nowrap",fontSize:11,position:"sticky",left:0,background:"#fff",zIndex:1},
  roleDiv:{padding:"8px 6px",background:"#f8fafc",fontWeight:700,fontSize:11,letterSpacing:.5,textTransform:"uppercase",borderTop:"2px solid #e2e8f0"},
  secDiv:{padding:"8px 6px",background:"#f8fafc",color:C.brand,fontWeight:700,fontSize:11,letterSpacing:1,textTransform:"uppercase"},
  eCell:{padding:4,background:"#f0f5ff",minWidth:140,cursor:"default"},
  ePanel:{display:"flex",flexDirection:"column",gap:4},
  offRow:{display:"flex",gap:2,flexWrap:"wrap"},
  oBtn:{padding:"2px 5px",fontSize:8,fontWeight:700,background:"#fff",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:3,cursor:"pointer"},
  oBtnOn:{background:"#fef3c7",color:C.accent,borderColor:C.accent},
  clrBtn:{padding:"2px 5px",fontSize:8,fontWeight:700,background:"#fef2f2",color:C.red,border:`1px solid ${C.red}44`,borderRadius:3,cursor:"pointer"},
  cInp:{width:"100%",padding:"4px 6px",fontSize:12,fontFamily:"monospace",background:"#fff",color:"#1e293b",border:`1px solid ${C.brand}`,borderRadius:3,outline:"none"},
  goBtn:{padding:"3px 8px",fontSize:10,fontWeight:700,background:C.green,color:"#fff",border:"none",borderRadius:3,cursor:"pointer"},
  tSel:{width:"100%",padding:"4px 4px",fontSize:10,background:"#fff",color:"#334155",border:"1px solid #d1d9e0",borderRadius:3,outline:"none"},
  doneBtn:{padding:"3px 8px",fontSize:9,fontWeight:600,background:"#e2e8f0",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:3,cursor:"pointer",alignSelf:"flex-end"},
  sInp:{flex:1,minWidth:100,padding:"8px 12px",fontSize:13,background:"#fff",color:"#1e293b",border:"1px solid #d1d9e0",borderRadius:6,outline:"none"},
  fSel:{padding:"8px 12px",fontSize:12,background:"#fff",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:6,outline:"none"},
  addBtn:{padding:"8px 16px",fontSize:12,fontWeight:700,background:C.brand,color:"#fff",border:"none",borderRadius:6,cursor:"pointer",whiteSpace:"nowrap"},
  vTog:{display:"flex",border:"1px solid #d1d9e0",borderRadius:6,overflow:"hidden"},
  vBtn:{padding:"7px 10px",fontSize:14,background:"#fff",color:"#94a3b8",border:"none",cursor:"pointer",lineHeight:1},
  vBtnOn:{background:C.brand,color:"#fff"},
  cardGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))",gap:10},
  tCard:{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden",boxShadow:"0 1px 2px rgba(0,0,0,0.03)"},
  cHdr:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderBottom:"1px solid #f1f5f9"},
  tNum:{fontSize:16,fontWeight:800,color:"#1e293b",fontFamily:"monospace"},
  sBdg:{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,border:"1px solid",textTransform:"uppercase"},
  cBody:{padding:"8px 12px"},
  remBtn:{width:"100%",padding:"6px",fontSize:10,color:C.red,background:"none",border:"none",borderTop:"1px solid #f1f5f9",cursor:"pointer"},
  ltd:{padding:"8px 8px",fontSize:12,color:"#334155",whiteSpace:"nowrap"},
  addForm:{background:"#fff",borderRadius:8,padding:16,marginBottom:12,border:"1px solid #e2e8f0",display:"flex",flexDirection:"column",gap:8,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  fInp:{padding:"8px 12px",fontSize:13,background:"#f8fafc",color:"#1e293b",border:"1px solid #d1d9e0",borderRadius:6,outline:"none"},
  saveBtn:{padding:"8px 20px",fontSize:12,fontWeight:700,background:C.green,color:"#fff",border:"none",borderRadius:6,cursor:"pointer"},
  canBtn:{padding:"8px 20px",fontSize:12,fontWeight:500,background:"none",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:6,cursor:"pointer"},
  dCat:{fontSize:13,fontWeight:700,padding:"12px 0 6px",borderBottom:"1px solid #e2e8f0",marginBottom:4},
  dRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderBottom:"1px solid #f1f5f9"},
  dNm:{fontSize:13,fontWeight:600,color:"#1e293b"},
  dRl:{fontSize:10,color:"#6b7785"},
  tBdg:{fontSize:10,fontWeight:700,padding:"2px 8px",background:C.light,color:C.brand,borderRadius:4},
  oBdg:{fontSize:10,fontWeight:600,padding:"2px 8px",background:"#fef3c7",color:C.accent,borderRadius:4},
  xBtn:{width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#94a3b8",background:"none",border:"1px solid #e2e8f0",borderRadius:4,cursor:"pointer"},
  // Repair-specific
  repairCard:{padding:"12px 14px",background:"#fff",borderRadius:8,border:"1px solid #e2e8f0",borderLeft:"4px solid",marginBottom:8,borderLeftColor:C.red},
  closeRepBtn:{padding:"6px 14px",fontSize:11,fontWeight:700,background:C.green,color:"#fff",border:"none",borderRadius:5,cursor:"pointer"},
  emptyMsg:{padding:20,textAlign:"center",color:"#94a3b8",fontSize:13,background:"#fff",borderRadius:8,border:"1px solid #e2e8f0"},
  // Modals
  modal:{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16},
  modalBox:{background:"#fff",borderRadius:12,padding:20,width:"100%",maxWidth:420,maxHeight:"80vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:8,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"},
};
