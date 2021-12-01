classdef Animal < matlab.mixin.Copyable
    properties
        Name string
        Order string
        Age int8
        Tameable string
    end
    methods
        function obj = Animal(name, age, order, tameable)
            obj.Name = name;
            obj.Order = order;
            obj.Age = age;
            obj.Tameable = tameable;
        end
		function obj = copy(obj)
			obj = copy@matlab.mixin.Copyable(obj);
		end
        function obj = noise(obj)
            disp("Grunt");
        end
        function obj = move(obj, meters)
            disp([obj.Name " moved " num2str(meters) "m."]);
        end
        function obj = sleep(obj, hours)
            disp([obj.Name " slept for " num2str(hours) "hrs."]);
        end
    end
end
