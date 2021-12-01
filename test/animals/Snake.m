classdef Snake < Animal
    methods
		function obj = Snake(name, years)
			obj@Animal(name, years * 18, "Serpentes", true);
		end
        function obj = noise(obj)
            disp("Hiss");
        end
        function obj = move(obj, meters)
            disp("Slithering..");
            move@Animal(obj, meters / 5);
        end
        function obj = sleep(obj, multiplier)
            disp("Hibernating..");
            sleep@Animal(obj, multiplier * 3);
        end
    end
end
